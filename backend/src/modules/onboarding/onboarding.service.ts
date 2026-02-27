import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Step1MobileDto, Step1VerifyDto, Step2DetailsDto, Step3BusinessDto, Step4ShopDto, Step5BankDto, Step6MachineDto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async registerMobile(dto: Step1MobileDto) {
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // Create or Update User with role = seller
        // We use upsert to handle re-registration or starting over if not onboarded
        const user = await this.prisma.user.upsert({
            where: { phone: dto.phone },
            update: {
                role: 'seller', // Ensure role is seller as per requirement
            },
            create: {
                phone: dto.phone,
                role: 'seller',
                isApproved: false,
            }
        });

        // Store OTP
        await this.prisma.otp.upsert({
            where: { phone: dto.phone },
            update: {
                otp,
                expiresAt,
            },
            create: {
                phone: dto.phone,
                otp,
                expiresAt,
            }
        });

        // Send OTP (Mock)
        console.log(`[ONBOARDING OTP] Sent ${otp} to ${dto.phone}`);

        return {
            message: 'OTP sent successfully',
            phone: dto.phone
        };
    }

    async verifyOtp(dto: Step1VerifyDto) {
        const otpRecord = await this.prisma.otp.findUnique({
            where: { phone: dto.phone }
        });

        if (!otpRecord || otpRecord.otp !== dto.otp) {
            throw new BadRequestException('Invalid OTP');
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        const user = await this.prisma.user.findUnique({
            where: { phone: dto.phone }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Delete OTP after successful verification
        await this.prisma.otp.delete({ where: { phone: dto.phone } });

        // Generate temporary token for onboarding flow
        const tokens = await this.generateOnboardingTokens(user);

        return {
            message: 'OTP verified successfully',
            ...tokens
        };
    }

    async updatePersonalDetails(userId: string, dto: Step2DetailsDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
            }
        });
    }

    async saveBusinessDetails(userId: string, dto: Step3BusinessDto, files: any) {
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

    async saveShopDetails(userId: string, dto: Step4ShopDto, files: any) {
        // Use the new ShopDetail model
        await this.prisma.shopDetail.upsert({
            where: { userId },
            update: {
                shopName: dto.shopName,
                address: dto.address,
                village: dto.village,
                pinCode: dto.pinCode,
                state: dto.state,
                district: dto.district,
            },
            create: {
                userId,
                shopName: dto.shopName,
                address: dto.address,
                village: dto.village,
                pinCode: dto.pinCode,
                state: dto.state,
                district: dto.district,
            }
        });

        // Save Shop Act License
        if (files?.shopActLicense?.[0]) {
            await this.saveFile(userId, 'OTHER', files.shopActLicense[0], 'SHOP_ACT_LICENSE');
        }

        return { message: 'Shop details saved successfully' };
    }

    async saveBankDetails(userId: string, dto: Step5BankDto, files: any) {
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

    async saveMachineDetails(userId: string, dto: Step6MachineDto) {
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
