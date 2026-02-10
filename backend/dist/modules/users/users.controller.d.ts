import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
