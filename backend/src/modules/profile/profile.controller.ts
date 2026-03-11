import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProfileService } from './profile.service';
import { existsSync, renameSync, unlinkSync, readdirSync } from 'fs';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/profile-images',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, 'temp-' + uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('phone_number') phoneNumber: string
    ) {
        if (!file) throw new BadRequestException('Image file is required');
        if (!phoneNumber) throw new BadRequestException('Phone number is required');

        // Sanitize phone number for filename
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        const extension = extname(file.originalname);
        const newFileName = `user_${cleanPhone}${extension}`;
        const finalRelativePath = `uploads/profile-images/${newFileName}`;
        const finalAbsPath = join(process.cwd(), 'uploads', 'profile-images', newFileName);

        // Cleanup old files for this user (different extensions)
        const dirPath = join(process.cwd(), 'uploads', 'profile-images');
        try {
            const files = readdirSync(dirPath);
            const userFiles = files.filter(f => f.startsWith(`user_${cleanPhone}.`));
            userFiles.forEach(f => {
                const p = join(dirPath, f);
                if (existsSync(p)) unlinkSync(p);
            });
        } catch (e) {
            console.error('Cleanup failed', e);
        }

        // Rename temp file to final location
        renameSync(file.path, finalAbsPath);

        // Update DB
        await this.profileService.updateProfileImage(phoneNumber, finalRelativePath);

        return {
            message: 'Profile image updated successfully',
            profile_image: finalRelativePath
        };
    }

    @Get(':phone_number')
    async getProfile(@Param('phone_number') phoneNumber: string) {
        return this.profileService.getProfileByPhone(phoneNumber);
    }
}
