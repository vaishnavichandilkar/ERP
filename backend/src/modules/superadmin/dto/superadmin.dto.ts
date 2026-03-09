import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveSellerDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    sellerId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
