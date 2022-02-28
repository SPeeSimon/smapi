const Recaptcha = require('express-recaptcha').RecaptchaV3;
const recaptcha = new Recaptcha(getPublicKey(), process.env.CAPTCHA_PRIVATE_KEY, { callback: 'cb' });

function isCaptchaEnabled() {
    return true === (process.env.CAPTCHA_ENABLED as unknown) || 'true' === process.env.CAPTCHA_ENABLED;
}

export function getPublicKey() {
    return process.env.CAPTCHA_PUBLIC_KEY;
}

export class Captcha {

    constructor(){}

    getPublicKey() {
        return isCaptchaEnabled() ? process.env.CAPTCHA_PUBLIC_KEY : '';
    }
    
    /**
     * 
     * @returns A middleware cheking for a valid captcha (if enabled).
     */
    captchaVerifyMiddleware() {
        if (isCaptchaEnabled()) {
            return recaptcha.middleware.verify;
        }
        return (request, response, next) => next();
    }

    /**
     * 
     * @returns A middleware cheking for a valid captcha (if enabled).
     */
    captchaRenderMiddleware() {
        if (isCaptchaEnabled()) {
            return recaptcha.middleware.render;
        }
        return (request, response, next) => next();
    }

}

export const instance = new Captcha();
