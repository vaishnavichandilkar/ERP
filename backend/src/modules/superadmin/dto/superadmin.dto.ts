import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveSellerDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sellerId: string;

    @ApiProperty({ required: false })
    @IsString()
    rejectionReason?: string;
}
