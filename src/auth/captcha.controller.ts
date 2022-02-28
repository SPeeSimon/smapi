import { Controller, Get } from '@nestjs/common';
import { Captcha } from './captcha.service';


@Controller('captcha')
export class CaptchaController {
    constructor(private recaptcha: Captcha) {}

    @Get('key')
    getKey() {
        return this.recaptcha.getPublicKey();
    }

}
