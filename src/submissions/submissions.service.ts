import { Injectable } from '@nestjs/common';
import { PositionRequest } from 'src/requests/entities/request.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
const zlib = require("zlib");
const util = require("util");
const unzip = util.promisify(zlib.unzip);

@Injectable()
export class SubmissionsService {
  create(createSubmissionDto: CreateSubmissionDto) {
    return 'This action adds a new submission';
  }

  findAll() {
    return `This action returns all submissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} submission`;
  }

  update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    return `This action updates a #${id} submission`;
  }

  remove(id: number) {
    return `This action removes a #${id} submission`;
  }

  async readJsonValue(row: PositionRequest) {
    const data = await unzip(Buffer.from(row.base64_sqlz, "base64"))
    const submission = {
      id: row.id,
      hash: row.hash,
      data: JSON.parse(data.toString()),
    };
    delete submission.data?.email;
    return submission;
  }
}
