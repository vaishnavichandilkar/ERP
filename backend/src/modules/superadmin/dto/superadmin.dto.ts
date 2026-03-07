import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveSellerDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    sellerId: number;

    @ApiProperty({ required: false })
    @IsString()
    rejectionReason?: string;
}
