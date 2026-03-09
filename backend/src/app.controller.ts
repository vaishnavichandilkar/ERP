import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

const RUNTIME_ID = Math.random().toString(36).substring(7);

@ApiTags('System')
@Controller('system')
export class AppController {
    @Get('runtime-id')
    @ApiOperation({ summary: 'Get current server runtime ID' })
    getRuntimeId() {
        return { runtimeId: RUNTIME_ID };
    }
}
