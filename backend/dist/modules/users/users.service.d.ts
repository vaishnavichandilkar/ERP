import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        username: string;
        passwordHash: string | null;
        mobile: string | null;
        facilityId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
