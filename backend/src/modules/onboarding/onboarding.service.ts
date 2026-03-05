import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Step1LanguageDto, Step2MobileDto, Step3VerifyDto, Step4DetailsDto, Step5BusinessDto, Step6ShopDto, Step7BankDto, Step8MachineDto } from './dto/onboarding.dto';

import { SmsService } from '../otp/sms.service';

@Injectable()
export class OnboardingService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private smsService: SmsService,
    ) { }

    async saveLanguage(dto: Step1LanguageDto) {
        // Step 1: Create a temporary user record to store the selection
        // This acts as a session for the onboarding flow
        let user;
        if (dto.userId) {
            user = await this.prisma.user.update({
                where: { id: dto.userId },
                data: { selected_language: dto.language }
            });
        } else {
            user = await this.prisma.user.create({
                data: {
                    selected_language: dto.language,
                    role: 'seller', // Default to seller for onboarding
                    verified: false
                }
            });
        }

        return {
            message: `Language '${dto.language}' selected`,
            userId: user.id,
            selectedLanguage: dto.language
        };
    }

    async registerMobile(dto: Step2MobileDto) {
        // 1. Find the temporary user session from Step 1
        const tempUser = await this.prisma.user.findUnique({
            where: { id: dto.userId }
        });

        if (!tempUser) {
            throw new BadRequestException('Onboarding session not found');
        }

        // 2. Check if phone exists in user table
        const existingUser = await this.prisma.user.findUnique({
            where: { phone: dto.phone }
        });

        let targetUserId = dto.userId;

        if (existingUser) {
            // Requirement 2: If phone exists
            if (existingUser.verified) {
                // If verified = true -> return error
                throw new ConflictException('Phone number already registered');
            } else {
                // If verified = false -> reuse same user
                // Update existing user with language from temp session
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { selected_language: tempUser.selected_language }
                });

                // Delete the temp session row if it's different from the record we're reusing
                if (tempUser.id !== existingUser.id) {
                    await this.prisma.user.delete({ where: { id: tempUser.id } });
                }

                targetUserId = existingUser.id;
            }
        } else {
            // Requirement 3: If phone does not exist
            // Update the temporary session user with the phone number
            await this.prisma.user.update({
                where: { id: dto.userId },
                data: {
                    phone: dto.phone,
                    verified: false
                }
            });
        }

        // 3. Send OTP
        await this.smsService.sendOtp(dto.phone);

        return {
            message: 'OTP sent successfully',
            phone: dto.phone,
            userId: targetUserId
        };
    }

    async verifyOtp(dto: Step3VerifyDto) {
        // 1. Verify OTP using SmsService
        const isValid = await this.smsService.verifyOtp(dto.phone, dto.otp);
        if (!isValid) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // 2. Find the user by phone (should exist now as we saved it in registerMobile)
        const user = await this.prisma.user.findUnique({
            where: { phone: dto.phone }
        });

        if (!user) {
            throw new BadRequestException('User record not found');
        }

        // 3. Update the same row: verified = true
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { verified: true }
        });

        // 4. Cleanup the verified OTP record
        await this.smsService.deleteOtp(dto.phone);

        // 5. Generate temporary token for the flow
        const tokens = await this.generateOnboardingTokens(updatedUser);

        return {
            message: 'OTP verified successfully.',
            ...tokens
        };
    }

    async updatePersonalDetails(userId: string, dto: Step4DetailsDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
            }
        });
    }

    async saveBusinessDetails(userId: string, dto: Step5BusinessDto, files: any) {
        // Save Udyog Aadhar Number as document entry
        await this.saveDocument(userId, 'OTHER', dto.udyogAadharNumber, 'UDYOG_AADHAR');

        // Save Udyog Aadhar Certificate
        if (files?.udyogAadharCertificate?.[0]) {
            await this.saveFile(userId, 'OTHER', files.udyogAadharCertificate[0], 'UDYOG_AADHAR_CERT');
        }

        // Save GST Number
        await this.saveDocument(userId, 'GST', dto.gstNumber);

        // Save GST Certificate
        if (files?.gstCertificate?.[0]) {
            await this.saveFile(userId, 'GST', files.gstCertificate[0]);
        }

        // Save Proof of Business (Optional)
        if (files?.businessProof?.[0]) {
            await this.saveFile(userId, 'OTHER', files.businessProof[0], 'BUSINESS_PROOF');
        }

        return { message: 'Business details saved successfully' };
    }

    async saveShopDetails(userId: string, dto: Step6ShopDto, files: any) {
        // Validate Pincode and get State and District
        const pincodeRecord = await this.prisma.pincode.findUnique({
            where: { pincode: dto.pinCode }
        });

        if (!pincodeRecord) {
            throw new BadRequestException('Invalid pincode. Pincode not found.');
        }

        if (!pincodeRecord.isActive) {
            throw new BadRequestException('Service is not active for this pincode yet.');
        }

        const state = pincodeRecord.state;
        const district = pincodeRecord.district;

        // Use the new ShopDetail model
        await this.prisma.shopDetail.upsert({
            where: { userId },
            update: {
                shopName: dto.shopName,
                address: dto.address,
                village: dto.village,
                pinCode: dto.pinCode,
                state: state,
                district: district,
            },
            create: {
                userId,
                shopName: dto.shopName,
                address: dto.address,
                village: dto.village,
                pinCode: dto.pinCode,
                state: state,
                district: district,
            }
        });

        // Save Shop Act License
        if (files?.shopActLicense?.[0]) {
            await this.saveFile(userId, 'OTHER', files.shopActLicense[0], 'SHOP_ACT_LICENSE');
        }

        return { message: 'Shop details saved successfully' };
    }

    async saveBankDetails(userId: string, dto: Step7BankDto, files: any) {
        // Save Bank Details
        await this.prisma.bankDetail.upsert({
            where: { userId },
            update: {
                holderName: dto.holderName,
                accountNo: dto.accountNo,
                ifsc: dto.ifsc,
                bankName: dto.bankName,
                panNumber: dto.panNumber,
            },
            create: {
                userId,
                holderName: dto.holderName,
                accountNo: dto.accountNo,
                ifsc: dto.ifsc,
                bankName: dto.bankName,
                panNumber: dto.panNumber,
            }
        });

        // Save Cancelled Cheque
        if (files?.cancelledCheque?.[0]) {
            await this.saveFile(userId, 'BANK', files.cancelledCheque[0], 'CANCELLED_CHEQUE');
        }

        // Save PAN Card
        if (files?.panCard?.[0]) {
            await this.saveFile(userId, 'PAN', files.panCard[0]);
        }

        return { message: 'Bank details saved successfully' };
    }

    async saveMachineDetails(userId: string, dto: Step8MachineDto) {
        await this.prisma.weighingMachineDetail.upsert({
            where: { userId },
            update: {
                isUsingOwnMachine: dto.isUsingOwnMachine,
                make: dto.isUsingOwnMachine ? dto.make : null,
                machineName: dto.machineName,
                modelNumber: dto.isUsingOwnMachine ? dto.modelNumber : null,
                machineType: dto.isUsingOwnMachine ? dto.machineType : null,
            },
            create: {
                userId,
                isUsingOwnMachine: dto.isUsingOwnMachine,
                make: dto.isUsingOwnMachine ? dto.make : null,
                machineName: dto.machineName,
                modelNumber: dto.isUsingOwnMachine ? dto.modelNumber : null,
                machineType: dto.isUsingOwnMachine ? dto.machineType : null,
            }
        });

        return { message: 'Weighing machine details saved successfully' };
    }

    async completeOnboarding(userId: string) {
        // Check if mandatory Step 6 is completed
        const machineDetail = await this.prisma.weighingMachineDetail.findUnique({
            where: { userId }
        });

        if (!machineDetail) {
            throw new BadRequestException('Weighing machine details are mandatory for onboarding completion');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                onboarded_at: new Date(),
            }
        });

        return {
            message: 'Onboarding complete. Your account is pending Superadmin approval.',
            status: 'PENDING_APPROVAL'
        };
    }

    // Helper functions
    private async saveFile(userId: string, type: any, file: any, category?: string) {
        return this.prisma.sellerDocument.create({
            data: {
                uploadedByUserId: userId,
                type,
                url: file.path,
                name: file.originalname,
                size: BigInt(file.size),
                category: category || null,
            }
        });
    }

    private async saveDocument(userId: string, type: any, name: string, category?: string) {
        return this.prisma.sellerDocument.create({
            data: {
                uploadedByUserId: userId,
                type,
                url: 'N/A', // Just storing the number/text as a doc entry for now
                name: name,
                category: category || null,
            }
        });
    }

    private async generateOnboardingTokens(user: any) {
        const jti = crypto.randomUUID();
        const payload = { sub: user.id, phone: user.phone, role: user.role, jti };

        const secret = this.configService.get('jwt.secret') || 'secret';
        const refreshSecret = this.configService.get('jwt.refreshSecret') || 'refreshSecret';

        const accessToken = this.jwtService.sign(payload, { secret });
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: '7d',
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // 1. Invalidate old sessions for this user (Rotate)
        await this.prisma.session.updateMany({
            where: { userId: user.id, isRevoked: false },
            data: { isRevoked: true },
        });

        // 2. Store Session
        await this.prisma.session.create({
            data: {
                userId: user.id,
                userType: user.role.toUpperCase(),
                jti: jti,
                refreshTokenHash: await bcrypt.hash(refreshToken, 10),
                expiresAt: expiresAt,
            }
        });

        // 3. Save Refresh Token in User Table
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: refreshToken }
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phone: user.phone,
                role: user.role,
            }
        };
    }
}
