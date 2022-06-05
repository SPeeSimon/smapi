import { Controller, Get, Logger, Redirect, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

const SCENERY_URL = process.env.SCENERY_URL;

class Redirector {
    constructor(private controller: string, private action: string, private newLocation: string, private urlParams?: unknown[]) {}

    isRequested(request: Request) {
        return (
            this.controller.toLowerCase() == ((request.query.c as string) || '').toLowerCase().trim() &&
            this.action.toLowerCase() == ((request.query.a as string) || '').toLowerCase().trim()
        );
    }

    hasRedirect() {
        return this.newLocation !== null && this.newLocation !== '';
    }
}


const redirections = [
    // new Redirector('AddModel', 'form', ''),
    // new Redirector('AddModel', 'addRequest', ''),
    // new Redirector('AddModel', 'success', ''),
    // new Redirector('AddModelValidator', 'viewRequest', `${SCENERY_URL}/#/verify/objects/:sig`, ['sig']), // https://scenery.flightgear.org/app.php?c=AddModelValidator&a=viewRequest&sig=2a3f1397810f8a0d5c1ee7a
    // new Redirector('AddModelValidator', 'modelViewer', ''),
    // new Redirector('AddModelValidator', 'validateRequest', ''),
    // new Redirector('AddObjects', 'form', ''),
    // new Redirector('AddObjects', 'massiveform', ''),
    // new Redirector('AddObjects', 'check', ''),
    // new Redirector('AddObjects', 'confirmMass', ''),
    // new Redirector('AddObjectsValidator', 'viewRequest', `${SCENERY_URL}/#/verify/objects/:sig`, ['sig']), // http://localhost:8082/app.php?c=AddObjectsValidator&a=viewRequest&sig=800842d18b10f1ce7ca682f47fcb175c0cec82b306f8f6cdb20317d622ce1b0d
    new Redirector('Authors', 'view', `${SCENERY_URL}/#/author/:id`, ['id']),
    new Redirector('Authors', 'browse', `${SCENERY_URL}/#/authors/`),
    // new Redirector('DeleteObjects', 'findform', ''),
    // new Redirector('DeleteObjects', 'findObjWithPos', ''),
    // new Redirector('DeleteObjects', 'confirmDeleteForm', ''),
    // new Redirector('DeleteObjects', 'requestForDelete', ''),
    // new Redirector('GenericValidator', 'rejectRequest', ''),
    new Redirector('Index', 'index', `${SCENERY_URL}/`),
    new Redirector('Models', 'browse', `${SCENERY_URL}/#/models/`),
    new Redirector('Models', 'browseRecent', `${SCENERY_URL}/#/models/`),
    new Redirector('Models', 'view', `${SCENERY_URL}/#/model/:id`, ['id']),
    // new Redirector('Models', 'modelViewer', ''), // `${SCENERY_URL}/#/model/:id`
    new Redirector('Models', 'thumbnail', `${SCENERY_URL}/scenemodels/model/:id/thumb`, ['id']),
    // new Redirector('Models', 'contentFilesInfos', ''),
    new Redirector('Models', 'getAC3D', `${SCENERY_URL}/scenemodels/model/:id/AC3D`, ['id']),
    new Redirector('Models', 'getPackage', `${SCENERY_URL}/scenemodels/model/:id/tgz`, ['id']),
    // new Redirector('Models', 'getTexture', ''), // `${SCENERY_URL}/scenemodels/model/:id/texture` // image/png
    new Redirector('Models', 'getFile', `${SCENERY_URL}/scenemodels/model/:id/model-content/:name`, ['id', 'name']), //  https://scenery.flightgear.org/app.php?c=Models&a=getFile&id=5312&name=htbocag1.png
    new Redirector('News', 'display', `${SCENERY_URL}/#/news/`),
    new Redirector('Objects', 'view', `${SCENERY_URL}/#/object/:id`, ['id']),
    new Redirector('Objects', 'search', `${SCENERY_URL}/#/objects/`),
    // new Redirector('ObjectValidator', 'viewRequest', `${SCENERY_URL}/#/verify/objects/:sig`, ['sig']), http://localhost:8082/app.php?c=ObjectValidator&a=viewRequest&sig=fb65be9a7bbfce6ba8c8fc6a97c0735e82f77f96b3115b381d94fdd01fb9f34c
    new Redirector('Plain', 'statistics', `${SCENERY_URL}/#/stats`),
    // new Redirector('Request', 'getGroupModelsMDXML', ''),
    // new Redirector('Request', 'getModelInfoXML', ''),
    // new Redirector('Request', 'getCountryCodeAtXML', ''),
    // new Redirector('ModelRequest', 'getGroupModelsMDXML', ''), // addmodel|updatemodel
    // new Redirector('ModelRequest', 'getModelInfoXML', ''), // addmodel|updatemodel
    // new Redirector('ModelRequest', 'getCountryCodeAtXML', ''), // addmodel|updatemodel
    // new Redirector('UpdateModel', 'selectModelForm', ''),
    // new Redirector('UpdateModel', 'modelUpdateForm', ''), // https://scenery.flightgear.org/app.php?c=UpdateModel&a=modelUpdateForm&modelId=5312
    // new Redirector('UpdateModel', 'addRequest', ''),
    // new Redirector('UpdateModel', 'success', ''),
    // new Redirector('UpdateModelValidator', 'viewRequest', `${SCENERY_URL}/#/verify/objects/:sig`, ['sig']),
    // new Redirector('UpdateModelValidator', 'modelViewer', ''),
    // new Redirector('UpdateModelValidator', 'getOldModelTexture', ''),
    // new Redirector('UpdateModelValidator', 'getOldModelTextureTN', ''),
    // new Redirector('UpdateObjects', 'findform', ''),
    // new Redirector('UpdateObjects', 'findObjWithPos', ''),
    // new Redirector('UpdateObjects', 'updateForm', ''),
    // new Redirector('UpdateObjects', 'check', ''),
    // new Redirector('Validator', 'actionOnRequest', ''),
    // new Redirector('Validator', 'validateRequest', ''),
    // new Redirector('Validator', 'rejectRequest', ''),
    // new Redirector('Validator', 'getNewModelPack', ''),
    // new Redirector('Validator', 'getNewModelAC3D', ''),
    // new Redirector('Validator', 'getNewModelThumb', ''),
    // new Redirector('Validator', 'getNewModelTexture', ''),
    // new Redirector('Validator', 'getNewModelTextureTN', '')
];

@ApiTags('Fligthgear')
@Controller()
export class RedirectController {
    /**
     * Get query params withouth the ones that are already used in the url
     * @param {Request} request The HTTP request
     * @param {Array} urlParams Params already handled in the url
     * @returns An array with the additional query params that needs to be included in the redirect
     */
    queryValuesForRedirect(request: Request, urlParams: string[]) {
        const excludeParams = ['a', 'c'].concat(urlParams);
        return Object.entries(request.query).filter((q) => !excludeParams.includes(q[0]));
    }

    makeRedirectUrl(requestedAction, request) {
        const newLocation = (requestedAction.urlParams || []).reduce(
            (val, param) => val.replace(`:${param}`, request.query[param]),
            requestedAction.newLocation,
        );
        const additionalQueryParams = this.queryValuesForRedirect(request, requestedAction.urlParams);

        if (additionalQueryParams.length == 0) {
            return newLocation;
        }
        return newLocation + '?redirected=true&' + additionalQueryParams.map((q) => q[0] + '=' + q[1]).join('&');
    }

    /**
     * Sends a redirect for the old url to app.php if possible.
     * Otherwise a redirect to the error page is send.
     */
    @ApiOperation({summary: 'This endpoint will redirect you from the old site to the new location on the new site as much as possible.'})
    @Get('/app.php')
    @ApiResponse({ status: 301, description: 'Redirects to the new location of the new website'})
    @Redirect()
    redirector(@Req() request: Request) {
        const foundRedirect = redirections.find((r) => r.isRequested(request));
        if (foundRedirect && foundRedirect.hasRedirect()) {
            // console.log('redirect ', request.originalUrl, 'to', foundRedirect);
            return { url: `${this.makeRedirectUrl(foundRedirect, request)}` };
        }
        Logger.warn(`redirect unknown for ${request.originalUrl}`, 'Redirect');
        return { url: `${SCENERY_URL}/#/notfound?redirected=true&origin=${encodeURIComponent(request.originalUrl)}` };
    }
}
