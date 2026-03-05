import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class StartOnboardingDto {
    @ApiProperty({
        description: 'The unique ID of the user starting the onboarding process',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class GetStatusDto {
    @ApiPropertyOptional({
        description: 'The unique ID of the user. Optional if x-session-id is provided via header.',
    })
    @IsString()
    @IsOptional()
    userId?: string;
}


