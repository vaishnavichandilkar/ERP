import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

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
            7: 'document_upload_completed'
        };
        return stepNames[step] || `step_${step}_completed`;
    }

    async startOnboarding(userId: number) {
        let profile = await this.prisma.sellerProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            // Check user's verified status to set initial step
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const initialStep = (user && user.verified) ? 3 : 0;

            profile = await this.prisma.sellerProfile.create({
                data: {
                    userId,
                    currentStep: initialStep,
                    status: 'IN_PROGRESS'
                }
            });
        } else if (profile.currentStep < 3) {
            // Sync step if it was somehow stuck below 3
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user && user.verified) {
                profile = await this.prisma.sellerProfile.update({
                    where: { id: profile.id },
                    data: { currentStep: 3 }
                });
            }
        }

        return {
            sessionId: profile.sessionId,
            sellerProfileId: profile.id,
            currentStep: profile.currentStep
        };
    }

    async getStatusBySession(sessionId: number) {
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

    async getStatusByUser(userId: number) {
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

    async submitStep(sessionId: number, stepNumber: number, stepData: any) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { sessionId }
        });

        if (!profile) {
            throw new NotFoundException('Session not found');
        }

        // Logic change: We allow submitting any step that is <= allowedStep.
        // This handles cases where a user might be sent back to an earlier step by the frontend
        // even if the backend 'currentStep' is further ahead.
        const allowedStep = profile.currentStep + 1;
        if (stepNumber > allowedStep) {
            throw new BadRequestException(`Cannot skip steps. Allowed step is ${allowedStep}`);
        }

        const newCurrentStep = Math.max(profile.currentStep, stepNumber);

        // Optional: If stepNumber === 7 (final), set to SUBMITTED
        // To be safe, look for a custom flag in body, or hardcode step 7.
        let updatedStatus = profile.status;
        if (stepNumber === 7) { // Adjust based on max steps
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
