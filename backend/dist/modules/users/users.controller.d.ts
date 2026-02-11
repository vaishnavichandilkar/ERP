import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        mobile: string | null;
        username: string;
        passwordHash: string | null;
        isActive: boolean;
        updatedAt: Date;
        facilityId: string;
    }>;
}
