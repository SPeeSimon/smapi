var express = require("express");
var router = express.Router();


class Redirector{
    constructor(controller, action, newLocation, urlParams) {
        this.controller = controller;
        this.action = action;
        this.newLocation = newLocation;
        this.urlParams = urlParams;
    }

    isRequested(request) {
        return this.controller.toLowerCase() == (request.query.c || '').toLowerCase().trim() &&
                this.action.toLowerCase() == (request.query.a || '').toLowerCase().trim();
    }

    hasRedirect() {
        return this.newLocation !== null && this.newLocation !== '';
    }
}


const redirections = [
    // new Redirector('AddModel', 'form', ''),
    // new Redirector('AddModel', 'addRequest', ''),
    // new Redirector('AddModel', 'success', ''),
    // new Redirector('AddModelValidator', 'viewRequest', ''),
    // new Redirector('AddModelValidator', 'modelViewer', ''),
    // new Redirector('AddModelValidator', 'validateRequest', ''),
    // new Redirector('AddObjects', 'form', ''),
    // new Redirector('AddObjects', 'massiveform', ''),
    // new Redirector('AddObjects', 'check', ''),
    // new Redirector('AddObjects', 'confirmMass', ''),
    // new Redirector('AddObjectsValidator', 'viewRequest', ''),
    new Redirector('Authors', 'view', `${process.env.SCENERY_URL}/#/author/:id`, ['id']),
    new Redirector('Authors', 'browse', `${process.env.SCENERY_URL}/#/authors/`),
    // new Redirector('DeleteObjects', 'findform', ''),
    // new Redirector('DeleteObjects', 'findObjWithPos', ''),
    // new Redirector('DeleteObjects', 'confirmDeleteForm', ''),
    // new Redirector('DeleteObjects', 'requestForDelete', ''),
    // new Redirector('GenericValidator', 'rejectRequest', ''),
    new Redirector('Index', 'index', `${process.env.SCENERY_URL}/`),
    new Redirector('Models', 'browse', `${process.env.SCENERY_URL}/#/models/`),
    new Redirector('Models', 'browseRecent', `${process.env.SCENERY_URL}/#/models/`),
    new Redirector('Models', 'view', `${process.env.SCENERY_URL}/#/model/:id`, ['id']),
    // new Redirector('Models', 'modelViewer', ''), // `${process.env.SCENERY_URL}/#/model/:id`
    new Redirector('Models', 'thumbnail', `${process.env.SCENERY_URL}/scenemodels/model/:id/thumb`, ['id']),
    // new Redirector('Models', 'contentFilesInfos', ''),
    new Redirector('Models', 'getAC3D', `${process.env.SCENERY_URL}/scenemodels/model/:id/AC3D`, ['id']),
    new Redirector('Models', 'getPackage', `${process.env.SCENERY_URL}/scenemodels/model/:id/tgz`, ['id']),
    // new Redirector('Models', 'getTexture', ''), // `${process.env.SCENERY_URL}/scenemodels/model/:id/texture` // image/png
    new Redirector('Models', 'getFile', `${process.env.SCENERY_URL}/scenemodels/model/:id/model-content/:name`, ['id', 'name']), //  https://scenery.flightgear.org/app.php?c=Models&a=getFile&id=5312&name=htbocag1.png
    new Redirector('News', 'display', `${process.env.SCENERY_URL}/#/news/`),
    new Redirector('Objects', 'view', `${process.env.SCENERY_URL}/#/object/:id`, ['id']),
    new Redirector('Objects', 'search', `${process.env.SCENERY_URL}/#/objects/`),
    // new Redirector('ObjectValidator', 'viewRequest', ''),
    new Redirector('Plain', 'statistics', `${process.env.SCENERY_URL}/#/stats`),
      // https://scenery.flightgear.org/app.php?c=Models&a=getFile&id=5312&name=htbocag1.png
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
    // new Redirector('UpdateModelValidator', 'viewRequest', ''),
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


function queryValuesForRedirect(request, urlParams) {
    const excludeParams = ['a', 'c'].concat(urlParams);
    return Object.entries(request.query)
            .filter(q => !excludeParams.includes(q[0]));
}


function makeRedirectUrl(requestedAction, request){
    const newLocation = (requestedAction.urlParams || []).reduce((val, param) => val.replace(`:${param}`, request.query[param]), requestedAction.newLocation);
    const additionalQueryParams = queryValuesForRedirect(request, requestedAction.urlParams);

    if (additionalQueryParams.length == 0) {
        return newLocation;
    }
    return newLocation + '?redirected=true&' + additionalQueryParams.map(q => q[0]+'='+q[1]).join('&');
}

/**
 * Sends a redirect for the old url to app.php if possible.
 * Otherwise a redirect to the error page is send.
 */
router.get("/app.php", function (request, response, next) {
    const foundRedirect = redirections.find(r => r.isRequested(request));
    
    if (foundRedirect && foundRedirect.hasRedirect()) {
        console.log('redirect ', request.originalUrl, 'to', foundRedirect);
        response.redirect(`${makeRedirectUrl(foundRedirect, request)}`);
        return;
    }

    console.log('redirect unknown for', request.originalUrl);
    response.redirect(`${process.env.SCENERY_URL}/#/notfound?redirected=true&origin=${encodeURIComponent(request.originalUrl)}`);
});

module.exports = router;
