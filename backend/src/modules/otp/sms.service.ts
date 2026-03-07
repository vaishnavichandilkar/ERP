import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SmsService {
    private snsClient: SNSClient;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.snsClient = new SNSClient({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }

    async sendOtp(phone: string): Promise<void> {
        // 1. Format phone number to E.164
        const formattedPhone = this.formatPhoneNumber(phone);

        // 2. Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        console.log('-------------------------------');
        console.log(`[SMS] OTP for ${phone}: ${otp}`);
        console.log('-------------------------------');
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiry

        // 3. Send OTP via AWS SNS
        try {
            const message = `Your WeighPro verification code is: ${otp}. Valid for 5 minutes.`;
            
            // NOTE: For India, AWS SNS often requires DLT registration (registration of Template and Entity ID).
            // If the message is not received, ensure the AWS account is out of Sandbox mode 
            // and has proper DLT credentials configured in the AWS Console.
            
            const command = new PublishCommand({
                Message: message,
                PhoneNumber: formattedPhone,
                MessageAttributes: {
                    // Note: SenderID must be 6 characters in many countries (like India).
                    // If not registered in DLT, it's better to omit it or use a registered one.
                    // 'AWS.SNS.SMS.SenderID': {
                    //     DataType: 'String',
                    //     StringValue: 'WGHPRO',
                    // },
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional',
                    },
                    // For India DLT compliance, you would add:
                    // 'AWS.MM.SMS.EntityId': { DataType: 'String', StringValue: 'YOUR_ENTITY_ID' },
                    // 'AWS.MM.SMS.TemplateId': { DataType: 'String', StringValue: 'YOUR_TEMPLATE_ID' },
                },
            });

            await this.snsClient.send(command);
        } catch (error) {
            console.error('AWS SNS Error:', error);
            // In development, we might want to see the OTP if SNS fails
            if (this.configService.get('NODE_ENV') !== 'production') {
                console.log(`[DEV ONLY] OTP for ${formattedPhone}: ${otp}`);
            }
            throw new InternalServerErrorException(`Failed to send SMS OTP: ${error.message}`);
        }

        // 4. Store/Update OTP in database (using original phone as key for consistency with queries)
        await this.prisma.otp.upsert({
            where: { phone },
            update: { otp, expiresAt, isVerified: false },
            create: { phone, otp, expiresAt, isVerified: false },
        });
    }

    private formatPhoneNumber(phone: string): string {
        // Remove spaces, dashes, parentheses
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        // If it already starts with +, return it
        if (cleaned.startsWith('+')) {
            return cleaned;
        }

        // Default to India (+91) if 10 digits
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        }

        // If it starts with 91 and is 12 digits, prepend +
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return `+${cleaned}`;
        }

        // Otherwise, just prepend + and hope for the best, or log a warning
        return `+${cleaned}`;
    }

    /**
     * Verifies the OTP and marks it as verified in the table.
     * Returns true if valid.
     */
    async verifyOtp(phone: string, otp: string): Promise<boolean> {
        const record = await this.prisma.otp.findUnique({
            where: { phone },
        });

        if (!record || record.otp !== otp) {
            return false;
        }

        if (record.expiresAt < new Date()) {
            return false;
        }

        // Mark as verified
        await this.prisma.otp.update({
            where: { phone },
            data: { isVerified: true }
        });

        return true;
    }

    /**
     * Cleans up the OTP record after the business logic is complete (e.g. user created)
     */
    async deleteOtp(phone: string): Promise<void> {
        await this.prisma.otp.deleteMany({ where: { phone } });
    }
}
