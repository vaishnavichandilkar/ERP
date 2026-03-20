import { Body, Controller, Get, Param, Patch, Post, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryMasterService } from '../services/category-master.service';
import { CreateCategoryDto, CreateSubCategoryDto, ToggleStatusDto, UpdateCategoryDto, UpdateSubCategoryDto } from '../dto/category.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@ApiTags('Category Master')
@Controller('category-master')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryMasterController {
    constructor(private readonly service: CategoryMasterService) { }

    @Post('category')
    @ApiOperation({ summary: 'Create a new Category' })
    @ApiResponse({ status: 201, description: 'Category created' })
    async createCategory(@Request() req, @Body() dto: CreateCategoryDto) {
        return this.service.createCategory(dto, req.user.userId);
    }

    @Post('sub-category')
    @ApiOperation({ summary: 'Create a new Sub Category' })
    @ApiResponse({ status: 201, description: 'Sub Category created' })
    async createSubCategory(@Request() req, @Body() dto: CreateSubCategoryDto) {
        return this.service.createSubCategory(dto, req.user.userId);
    }

    @Get('categories/dropdown')
    @ApiOperation({ summary: 'Get Categories for dropdown' })
    @ApiResponse({ status: 200, description: 'List of Categories' })
    async getDropdown(@Request() req) {
        return this.service.getCategoriesForDropdown(req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get Category with Sub Categories listing' })
    @ApiResponse({ status: 200, description: 'Nested Category list' })
    async getListing(@Request() req) {
        return this.service.getCategoryListing(req.user.userId);
    }

    @Patch('category/:id/status')
    @ApiOperation({ summary: 'Toggle Category status' })
    @ApiResponse({ status: 200, description: 'Category status updated' })
    async toggleCategoryStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ToggleStatusDto,
    ) {
        return this.service.toggleCategoryStatus(id, dto, req.user.userId);
    }

    @Patch('sub-category/:id/status')
    @ApiOperation({ summary: 'Toggle Sub Category status' })
    @ApiResponse({ status: 200, description: 'Sub Category status updated' })
    async toggleSubCategoryStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ToggleStatusDto,
    ) {
        return this.service.toggleSubCategoryStatus(id, dto, req.user.userId);
    }

    @Patch('category/:id')
    @ApiOperation({ summary: 'Update Category name' })
    @ApiResponse({ status: 200, description: 'Category updated' })
    async updateCategory(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.service.updateCategory(id, dto, req.user.userId);
    }

    @Patch('sub-category/:id')
    @ApiOperation({ summary: 'Update Sub Category name' })
    @ApiResponse({ status: 200, description: 'Sub Category updated' })
    async updateSubCategory(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSubCategoryDto,
    ) {
        return this.service.updateSubCategory(id, dto, req.user.userId);
    }
}
