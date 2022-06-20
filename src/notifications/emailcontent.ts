import { Logger } from '@nestjs/common';
import * as Eta from 'eta';
const path = require("path")

export class EmailContent {
    subject: string;
    templateFile: string;
    context: any;

    constructor(subject: string, templateFile: string, context?: any){
        this.subject = subject;
        this.templateFile = templateFile;
        this.context = context || {};
    }
}

export enum SendTo {
    USER,
    MAINTAINERS,
}

export class EmailFactory {

    public async send(mail: EmailContent, to: string, backend: SendTo) {
        const from = '"FlightGear Scenery Database" <no-reply@example.com>';

        var headers = [
            "MIME-Version: 1.0",
            "From: $from",
            "X-Mailer: PHP-xxx",
        ];

        
        if (backend == SendTo.MAINTAINERS) {
            if( to !== '' ) {
                // sourceforge mailing-list does not like to be in Bcc
                headers.push("Cc: flightgear-scenemodels-review@lists.sourceforge.net");
            } else {
                // headers.push("flightgear-scenemodels-review@lists.sourceforge.net");
                headers.push("test@example.com");
            }
        }

        const message = await Eta.renderFile(`${path.join(__dirname, "emailcontent")}/${mail.templateFile}`, {
            dtg: new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long'}).format(new Date()),
            ...mail.context
        });
        Logger.log(`TODO... sendMail ${mail.subject}: ${message}`, 'MAIL');
        // sendMail(to, mail.subject, mail.message, headers, process.env.MAILARGS);
    }


    public static getPendingRequestsEmailContent(requests, invalidRequests) {
        return new EmailContent("Pending requests", 'PendingRequests.email.txt', {requests, invalidRequests});
    }

    public static getPendingRequestsNoneEmailContent(requests, invalidRequests) {
        return new EmailContent("Pending requests", 'PendingRequestsNone.email.txt', {requests, invalidRequests});
    }
    
    public static getObjectsAddRequestAcceptedEmailContent(request, comment) {
        return new EmailContent("Object(s) import accepted", 'ObjectsAddRequestAccepted.email.txt', {request, comment});
    }
    
    public static getObjectsAddRequestPendingEmailContent(ipaddr, host, request) {
        return new EmailContent("Object(s) import needs validation", 'ObjectsAddRequestPending.email.txt', {ipaddr, host, request});
    }
    
    public static getObjectsAddRequestRejectedEmailContent(request, comment) {
        return new EmailContent("Object(s) import rejected", 'ObjectsAddRequestRejected.email.txt', {request, comment});
    }
    
    public static getObjectsAddSentForValidationEmailContent(ipaddr, host, request) {
        return new EmailContent("Object(s) import", 'ObjectsAddSentForValidation.email.txt', {ipaddr, host, request});
    }
    
    public static getModelUpdateRequestAcceptedEmailContent(request, comment) {
        return new EmailContent("3D model update accepted", 'ModelUpdateRequestAccepted.email.txt', {request, comment});
    }
    
    public static getModelUpdateRequestPendingEmailContent(ipaddr, host, request) {
        return new EmailContent("3D model update needs validation.", 'ModelUpdateRequestPending.email.txt', {ipaddr, host, request});
    }
    
    public static getModelUpdateRequestRejectedEmailContent(request, comment) {
        return new EmailContent("3D model update rejected", 'ModelUpdateRequestRejected.email.txt', {request, comment});
    }
    
    public static getModelUpdateRequestSentForValidationEmailContent(ipaddr, host, request) {
        return new EmailContent("3D model update request", 'ModelUpdateRequestSentForValidation.email.txt', {ipaddr, host, request});
    }
    
    public static getModelUpdateRequestSentForValidationAuthorEmailContent(ipaddr, host, request) {
        return new EmailContent("3D model update request", 'ModelUpdateRequestSentForValidationAuthor.email.txt', {ipaddr, host, request});
    }
    
    public static getObjectRequestAcceptedEmailContent(request, comment) {
        return new EmailContent("Object request accepted", 'ObjectRequestAccepted.email.txt', {request, comment});
    }
    
    public static getObjectRejectedEmailContent(request, comment) {
        return new EmailContent("Object request rejected", 'ObjectRejected.email.txt', {request, comment});
    }
    
    public static getObjectDeleteRequestPendingEmailContent(ipaddr, host, modelMD, request) {
        return new EmailContent("Object deletion needs validation", 'ObjectDeleteRequestPending.email.txt', {ipaddr, host, modelMD, request});
    }
    
    public static getObjectDeleteRequestSentForValidationEmailContent(ipaddr, host, request, modelMD) {
        return new EmailContent("Object deletion", 'ObjectDeleteRequestSentForValidation.email.txt', {ipaddr, host, request, modelMD});
    }
    
    public static getObjectUpdateRequestPendingEmailContent(ipaddr, host, oldModelMD, newModelMD, request) {
        return new EmailContent("Object update needs validation", 'ObjectUpdateRequestPending.email.txt', {ipaddr, host, oldModelMD, newModelMD, request});
    }
    
    public static getObjectUpdateRequestSentForValidationEmailContent(ipaddr, host, request, oldModelMD, newModelMD) {
        return new EmailContent("Object update", 'ObjectUpdateRequestSentForValidation.email.txt', {ipaddr, host, request, oldModelMD, newModelMD});
    }
    
    public static getAddModelRequestAcceptedEmailContent(request, comment) {
        return new EmailContent("3D model import accepted", 'AddModelRequestAccepted.email.txt', {request, comment});
    }
    
    public static getAddModelRequestPendingEmailContent(ipaddr, host, request) {
        return new EmailContent("3D model import needs validation.", 'AddModelRequestPending.email.txt', {ipaddr, host, request});
    }
    
    public static getAddModelRequestRejectedEmailContent(request, comment) {
        return new EmailContent("3D model import rejected", 'AddModelRequestRejected.email.txt', {request, comment});
    }
    
    public static getAddModelRequestSentForValidationEmailContent(ipaddr, host, request) {
        return new EmailContent("3D model import", 'AddModelRequestSentForValidation.email.txt', {ipaddr, host, request});
    }

    public static getAuthorEmailVerifyEmailContent(linkUrl: string, token: string) {
        return new EmailContent("FlightGear Scenery Database - email verification", 'AuthorVerifyEmail.email.txt', {linkUrl, token});
    }

}
