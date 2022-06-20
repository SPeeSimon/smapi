import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';
import { SubmissionApprovalDto } from './dto/submission-approval.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/auth/dto/User.entity';
import { LoggedInUser } from 'src/auth/loggedinuser';

@ApiTags('Submission')
@Controller('submissions/verify')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) {}

    @Get()
    @RequireTokenAuthentication()
    findAll(@LoggedInUser() user: User) {
        return this.submissionsService.findAll();
    }

    @Get(':id')
    @RequireTokenAuthentication()
    findOne(@Param('id') id: string, @LoggedInUser() user: User) {
        return this.submissionsService.findOne(+id);
    }

    @Post()
    @RequireTokenAuthentication()
    create(@Body() submissionApproval: SubmissionApprovalDto, @LoggedInUser() user: User) {
      if (submissionApproval.approved) {
        Logger.log(`Submission {${submissionApproval.submission}} was APPROVED`);

      } else {
        Logger.log(`Submission {${submissionApproval.submission}} was REJECTED`);
      }
      return 'TODO implement';
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto, @LoggedInUser() user: User) {
        return this.submissionsService.update(+id, updateSubmissionDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    remove(@Param('id') id: string, @LoggedInUser() user: User) {
        return this.submissionsService.remove(+id);
    }
}
