
export class RequestorDetails {
    ipaddress: any;
    host: string;
    email?: string;
}


export class SubmissionCreatedEvent {
    static readonly EVENT_NAME = 'request.created';

    constructor(public requestedBy: RequestorDetails, public hash: string, public payload: any){}

}