import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { PositionRequest } from './entities/request.entity';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SerializeRequest } from './request-serializer.service';
import { Zipped64 } from 'src/utils/Zipped64';

const crypto = require('crypto');

const HOSTNAME = require('os').hostname();
const HOST_RANDOM = crypto.randomBytes(16).toString();


@Injectable()
export class SubmissionsService {
    constructor(
        @InjectRepository(PositionRequest) private positionRequestRepository: Repository<PositionRequest>,
        private serializeRequestService: SerializeRequest,
    ) {}

    create(createSubmissionDto: unknown) {
        return 'This action adds a new submission';
    }

    saveRequest(request) {
        const encodedRequest = Zipped64.encodeJSON(this.serializeRequestService.serializeRequest(request));
        const shaToCompute = `<${new Date().getTime()}><${HOSTNAME}><${request.host}><${
            request.remoteAddress
        }><${HOST_RANDOM}><${encodedRequest}>`;
        const sig = crypto.createHash('sha256').update(shaToCompute, 'utf8').digest();

        return this.positionRequestRepository.save({
            hash: sig,
            base64_sqlz: encodedRequest,
        });
    }

    findAll() {
        return this.positionRequestRepository
            .find({
                order: { id: 'ASC' },
            })
            .then((result) => {
                return result.map((r) => {
                    try {
                        return { result: 'ok', id: r.id, hash: r.hash, data: this.serializeRequestService.getRequestFromRow(r) };
                    } catch (error) {
                        return { result: 'failed', id: r.id, hash: r.hash, data: error };
                    }
                });
            });
    }

    public getPendingRequests() {
        return this.findAll().then(result => {return {
            ok: result.filter(e => e.result == 'ok'),
            failed: result.filter(e => e.result == 'failed'), // new RequestError(row.id, row.hash, ex.message)
        }});
    }


    findOne(id: number) {
        return this.positionRequestRepository.findOneOrFail(id)
                  // .then(result => this.serializeRequestService.getRequestFromRow(result))
                  .then(result => this.readJsonValue(result));
    }

    findOneBySig(sig) {
        return this.positionRequestRepository.findOneOrFail({
            where: { spr_hash: sig },
        })
        .then(result => this.readJsonValue(result));
        // .then(result => this.serializeRequestService.getRequestFromRow(result));
    }

    update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
        return `This action updates a #${id} submission`;
    }

    remove(id: number) {
        return this.positionRequestRepository.delete(id).then((result) => result.affected > 0);
    }

    removeWithSig(sig) {
        const options = {
            where: { hash: sig },
        } as FindConditions<PositionRequest>;
        return this.positionRequestRepository.delete(options).then((result) => result.affected > 0);
    }

    async readJsonValue(row: PositionRequest) {
        const submission = {
            id: row.id,
            hash: row.hash,
            data: Zipped64.decodeJSON(row.base64_sqlz),
        };
        delete submission.data?.email;
        return submission;
    }
}
