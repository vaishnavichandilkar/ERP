import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    async sendMail(to: string, subject: string, content: string) {
        console.log(`[MAIL MOCK] To: ${to}, Subject: ${subject}, Content: ${content}`);
        return true;
    }
}
