import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { RequireTokenAuthentication } from 'src/auth/auth.decorator';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) {}

    @Get()
    @RequireTokenAuthentication()
    findAll() {
        return this.submissionsService.findAll();
/*

  new RequestDAO().getPendingRequests()
    .then((result) => {
      if (result.length === 0) {
        return response.json([]);
      }

      let submissions = [];
      let proms = result.rows.map((row) => unzip(Buffer.from(row["spr_base64_sqlz"], "base64")));

      Promise.all(proms)
        .then((data) => {
          data.forEach((s, idx) => {
            const submission = {
              id: result.rows[idx]["spr_id"],
              // hash: result.rows[idx]['spr_hash'],
              data: JSON.parse(s.toString()),
            };
            if (submission.data && submission.data.email) {
              delete submission.data.email;
            }
            submissions.push(submission);
          });
          response.json(submissions);
        })
        .catch((err) => {
          console.error(err);
          response.sendStatus(500);
        });
    })
    .catch((err) => {
      console.log('ERROR', request, err)
      return response.status(500).send("Database Error");
    });
*/
    }

    @Get(':id')
    @RequireTokenAuthentication()
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(+id);
/*
  new RequestDAO().getRequest(toNumber(request.params.id))
    .then((result) => {
      if (result.rows.length === 0) {
        return response.status(404).send("Submission not found");
      }

      const row = result.rows[0];
      unzip(Buffer.from(row["spr_base64_sqlz"], "base64"))
        .then((data) => {
          const submission = {
            id: row["spr_id"],
            // hash: row['spr_hash'],
            data: JSON.parse(data.toString()),
          };
          if (submission.data && submission.data.email) {
            delete submission.data.email;
          }
          response.json(submission);
        })
        .catch((err) => {
          console.error(err);
          response.sendStatus(500);
        });
    })
    .catch((err) => {
      return response.status(500).send("Database Error");
    });
*/
    }

    @Post()
    @RequireTokenAuthentication()
    create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionsService.create(createSubmissionDto);
    }

    @Patch(':id')
    @RequireTokenAuthentication()
    update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
        return this.submissionsService.update(+id, updateSubmissionDto);
    }

    @Delete(':id')
    @RequireTokenAuthentication()
    remove(@Param('id') id: string) {
        return this.submissionsService.remove(+id);
    }
}
