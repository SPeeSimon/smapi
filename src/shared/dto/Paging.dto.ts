import { Query } from "@nestjs/common";

export class Paging {
    constructor(@Query('offset') public offset: number, @Query('limit') public limit: number) {}
}
