import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionBankService } from './question-bank.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Question Bank')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('question-bank')
export class QuestionBankController {
    constructor(private readonly questionBankService: QuestionBankService) { }

    @Get('sets')
    @ApiOperation({ summary: 'List question sets with filters' })
    findSets(
        @Query('positionId') positionId?: string,
        @Query('levelId') levelId?: string,
        @CurrentUser() user?: any
    ) {
        // If Admin, they might want to see everything or just global sets
        // For now, let's allow them to see all if they are admin
        const companyId = user?.role === 'ADMIN' ? undefined : user?.companyId;

        return this.questionBankService.findSets({
            companyId,
            positionId,
            levelId,
            isAdmin: user?.role === 'ADMIN'
        });
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get question counts summary' })
    getSummary(@CurrentUser() user: any) {
        return this.questionBankService.getSummary(user.role === 'ADMIN' ? undefined : user.companyId);
    }

    @Post('sets')
    @ApiOperation({ summary: 'Create a new question set' })
    createSet(@Body() data: any, @CurrentUser() user: any) {
        // Strict role-based companyId assignment
        let companyId: string | null = null;

        if (user.role === 'ADMIN') {
            companyId = data.companyId || null;
        } else if (user.role === 'EMPLOYER') {
            if (!user.companyId) {
                // This should not happen with proper registration, but we check for safety
                throw new Error('Employer must be associated with a company to create question sets');
            }
            companyId = user.companyId;
        } else {
            throw new Error('Only Admin and Employers can create question sets');
        }

        return this.questionBankService.createSet({
            ...data,
            companyId
        });
    }

    @Get('sets/:id')
    @ApiOperation({ summary: 'Get question set detail' })
    findSetOne(@Param('id') id: string) {
        return this.questionBankService.findSetOne(id);
    }

    @Post('sets/:id/questions')
    @ApiOperation({ summary: 'Add a question to a set' })
    addQuestion(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
        return this.questionBankService.addQuestionToSet(id, data, user.companyId, user.role);
    }

    @Post('sets/:id/questions/bulk')
    @ApiOperation({ summary: 'Add multiple questions to a set' })
    bulkAddQuestions(@Param('id') id: string, @Body() data: { questions: any[] }, @CurrentUser() user: any) {
        return this.questionBankService.bulkAddQuestions(id, data.questions, user.companyId, user.role);
    }

    @Patch('sets/:id')
    @ApiOperation({ summary: 'Update a question set' })
    updateSet(@Param('id') id: string, @Body() data: any) {
        return this.questionBankService.updateSet(id, data);
    }

    @Delete('sets/:id')
    @ApiOperation({ summary: 'Delete a question set' })
    deleteSet(@Param('id') id: string, @CurrentUser() user: any) {
        return this.questionBankService.deleteSet(id, user.companyId, user.role);
    }

    @Patch('questions/:id')
    @ApiOperation({ summary: 'Update a question' })
    updateQuestion(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
        return this.questionBankService.updateQuestion(id, data, user.companyId, user.role);
    }

    @Delete('questions/:id')
    @ApiOperation({ summary: 'Delete a question' })
    deleteQuestion(@Param('id') id: string, @CurrentUser() user: any) {
        return this.questionBankService.deleteQuestion(id, user.companyId, user.role);
    }

    @Post('sets/:id/reorder')
    @ApiOperation({ summary: 'Reorder questions in a set' })
    reorder(@Param('id') id: string, @Body() data: { questionIds: string[] }, @CurrentUser() user: any) {
        return this.questionBankService.reorderQuestions(id, data.questionIds, user.companyId, user.role);
    }
}
