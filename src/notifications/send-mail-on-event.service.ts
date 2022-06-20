import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionCreatedEvent } from 'src/submissions/events/submission-created.event.dto';
import { EmailFactory, SendTo } from './emailcontent';

@Injectable()
export class SendMailOnEventService {

    @OnEvent(SubmissionCreatedEvent.EVENT_NAME)
    handleOrderCreatedEvent(event: SubmissionCreatedEvent) {
       
        // Retrieving the IP address of the submitter (takes some time to resolve the IP address though).

        var emailSubmit = EmailFactory.getAddModelRequestPendingEmailContent(event.requestedBy.ipaddress, event.requestedBy.host, event.payload);
        new EmailFactory().send(emailSubmit, "", SendTo.MAINTAINERS);

        // Mailing the submitter to tell him that his submission has been sent for validation
        var emailSubmitContr = EmailFactory.getAddModelRequestSentForValidationEmailContent(event.requestedBy.ipaddress, event.requestedBy.host, event.payload);
        new EmailFactory().send(emailSubmitContr, event.requestedBy.email, SendTo.USER);
    }


}
