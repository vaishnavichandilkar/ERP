import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SellerOnboardingService {
    constructor(private prisma: PrismaService) { }

    private getStepName(step: number): string {
        const stepNames: Record<number, string> = {
            1: 'language_selected',
            2: 'number_submitted',
            3: 'number_verified',
            4: 'personal_details_completed',
            5: 'business_details_completed',
            6: 'shop_details_completed',
            7: 'bank_details_completed',
            8: 'machine_details_completed',
            9: 'document_upload_completed'
        };
        return stepNames[step] || `step_${step}_completed`;
    }

    async startOnboarding(userId: string) {
        let profile = await this.prisma.sellerProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            profile = await this.prisma.sellerProfile.create({
                data: {
                    userId,
                    currentStep: 0,
                    status: 'IN_PROGRESS',
                    sessionId: uuidv4()
                }
            });
        }

        return {
            sessionId: profile.sessionId,
            sellerProfileId: profile.id,
            currentStep: profile.currentStep
        };
    }

    async getStatusBySession(sessionId: string) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { sessionId },
            include: { reviews: { orderBy: { step: 'asc' } } }
        });

        if (!profile) throw new NotFoundException('Session not found');

        return {
            sellerProfileId: profile.id,
            currentStep: profile.currentStep,
            status: profile.status,
            nextStep: profile.currentStep + 1,
            completedSteps: profile.reviews.map(r => this.getStepName(r.step)),
            savedStepData: profile.reviews.map(r => ({
                step: r.step,
                stepName: this.getStepName(r.step),
                status: r.status,
                data: r.data
            }))
        };
    }

    async getStatusByUser(userId: string) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { userId },
            include: { reviews: { orderBy: { step: 'asc' } } }
        });

        if (!profile) throw new NotFoundException('Profile not found');

        return {
            sellerProfileId: profile.id,
            currentStep: profile.currentStep,
            status: profile.status,
            nextStep: profile.currentStep + 1,
            completedSteps: profile.reviews.map(r => this.getStepName(r.step)),
            savedStepData: profile.reviews.map(r => ({
                step: r.step,
                stepName: this.getStepName(r.step),
                status: r.status,
                data: r.data
            }))
        };
    }

    async submitStep(sessionId: string, stepNumber: number, stepData: any) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { sessionId }
        });

        if (!profile) {
            throw new NotFoundException('Session not found');
        }

        const allowedStep = profile.currentStep + 1;
        if (stepNumber > allowedStep) {
            throw new BadRequestException(`Cannot skip steps. Allowed step is ${allowedStep}`);
        }

        const newCurrentStep = Math.max(profile.currentStep, stepNumber);

        // Optional: If stepNumber === 9 (assuming 9 is final based on existing code), set to SUBMITTED
        // To be safe, look for a custom flag in body, or hardcode step 9. Let's assume step 9 is final.
        let updatedStatus = profile.status;
        if (stepNumber === 9) { // Adjust based on max steps
            updatedStatus = 'SUBMITTED';
        } else if (stepData && stepData.isFinalStep) {
            updatedStatus = 'SUBMITTED';
        }

        // Update profile
        const updatedProfile = await this.prisma.sellerProfile.update({
            where: { id: profile.id },
            data: {
                currentStep: newCurrentStep,
                status: updatedStatus
            }
        });

        // Step review
        const existingReview = await this.prisma.sellerStepReview.findUnique({
            where: {
                sellerProfileId_step: {
                    sellerProfileId: profile.id,
                    step: stepNumber
                }
            }
        });

        if (existingReview) {
            if (existingReview.status === 'APPROVED') {
                throw new BadRequestException('This step has already been approved and cannot be resubmitted');
            }
            await this.prisma.sellerStepReview.update({
                where: { id: existingReview.id },
                data: {
                    status: 'PENDING',
                    data: stepData || {},
                    remark: null
                }
            });
        } else {
            await this.prisma.sellerStepReview.create({
                data: {
                    sellerProfileId: profile.id,
                    step: stepNumber,
                    data: stepData || {},
                    status: 'PENDING'
                }
            });
        }

        return {
            success: true,
            currentStep: updatedProfile.currentStep,
            status: updatedProfile.status
        };
    }

}
