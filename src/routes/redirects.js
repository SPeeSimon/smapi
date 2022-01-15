var express = require("express");
var router = express.Router();


class Redirector{
    constructor(controller, action, newLocation, hasId=false) {
        this.controller = controller;
        this.action = action;
        this.newLocation = newLocation;
        this.hasId = hasId;
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
    new Redirector('AddModel', 'form', ''),
    new Redirector('AddModel', 'addRequest', ''),
    new Redirector('AddModel', 'success', ''),
    new Redirector('AddModelValidator', 'viewRequest', ''),
    new Redirector('AddModelValidator', 'modelViewer', ''),
    new Redirector('AddModelValidator', 'validateRequest', ''),
    new Redirector('AddObjects', 'form', ''),
    new Redirector('AddObjects', 'massiveform', ''),
    new Redirector('AddObjects', 'check', ''),
    new Redirector('AddObjects', 'confirmMass', ''),
    new Redirector('AddObjectsValidator', 'viewRequest', ''),
    new Redirector('Authors', 'view', `${process.env.SCENERY_URL}/#/author/:id`, true),
    new Redirector('Authors', 'browse', `${process.env.SCENERY_URL}/#/authors/`),
    new Redirector('DeleteObjects', 'findform', ''),
    new Redirector('DeleteObjects', 'findObjWithPos', ''),
    new Redirector('DeleteObjects', 'confirmDeleteForm', ''),
    new Redirector('DeleteObjects', 'requestForDelete', ''),
    new Redirector('GenericValidator', 'rejectRequest', ''),
    new Redirector('Index', 'index', ''),
    new Redirector('Models', 'browse', '/models'),
    new Redirector('Models', 'browseRecent', `${process.env.SCENERY_URL}/#/models/`),
    new Redirector('Models', 'view', `${process.env.SCENERY_URL}/#/model/:id`, true),
    new Redirector('Models', 'modelViewer', ''),
    new Redirector('Models', 'thumbnail', ''),
    new Redirector('Models', 'contentFilesInfos', ''),
    new Redirector('Models', 'getAC3D', ''),
    new Redirector('Models', 'getPackage', ''),
    new Redirector('Models', 'getTexture', ''),
    new Redirector('Models', 'getRawFile', ''),
    new Redirector('Models', 'getFile', ''),
    new Redirector('News', 'display', `${process.env.SCENERY_URL}/#/news/`),
    new Redirector('Objects', 'view', `${process.env.SCENERY_URL}/#/object/:id`, true),
    new Redirector('Objects', 'search', `${process.env.SCENERY_URL}/#/objects/`),
    new Redirector('ObjectValidator', 'viewRequest', ''),
    new Redirector('Plain', 'statistics', `${process.env.SCENERY_URL}/#/stats`),
    new Redirector('Request', 'getGroupModelsMDXML', ''),
    new Redirector('Request', 'getModelInfoXML', ''),
    new Redirector('Request', 'getCountryCodeAtXML', ''),
    new Redirector('UpdateModel', 'selectModelForm', ''),
    new Redirector('UpdateModel', 'modelUpdateForm', ''),
    new Redirector('UpdateModel', 'addRequest', ''),
    new Redirector('UpdateModel', 'success', ''),
    new Redirector('UpdateModelValidator', 'viewRequest', ''),
    new Redirector('UpdateModelValidator', 'modelViewer', ''),
    new Redirector('UpdateModelValidator', 'getOldModelTexture', ''),
    new Redirector('UpdateModelValidator', 'getOldModelTextureTN', ''),
    new Redirector('UpdateObjects', 'findform', ''),
    new Redirector('UpdateObjects', 'findObjWithPos', ''),
    new Redirector('UpdateObjects', 'updateForm', ':id_to_update'),
    new Redirector('UpdateObjects', 'check', ''),
    new Redirector('Validator', 'actionOnRequest', ''),
    new Redirector('Validator', 'validateRequest', ''),
    new Redirector('Validator', 'rejectRequest', ''),
    new Redirector('Validator', 'getNewModelPack', ''),
    new Redirector('Validator', 'getNewModelAC3D', ''),
    new Redirector('Validator', 'getNewModelThumb', ''),
    new Redirector('Validator', 'getNewModelTexture', ''),
    new Redirector('Validator', 'getNewModelTextureTN', '')
];

function queryValuesForRedirect(request, hasId) {
    const excludeParams = hasId ? ['a', 'c', 'id'] : ['a', 'c'];
    return Object.entries(request.query)
            .filter(q => !excludeParams.includes(q[0]));
}

function makeRedirectUrl(requestedAction, request){
    const newLocation = requestedAction.newLocation.replace(':id', request.query.id);
    const additionalQueryParams = queryValuesForRedirect(request, requestedAction.hasId);

    if (additionalQueryParams.length == 0) {
        return newLocation;
    }
    return newLocation + '?redirected=true&' + additionalQueryParams.map(q => q[0]+'='+q[1]).join('&');
}

router.get("/app.php", function (request, response, next) {
    const requestedAction = redirections.find(r => r.isRequested(request));
    
    if (requestedAction && requestedAction.hasRedirect()) {
        console.log('redirect ', request.originalUrl, 'to', requestedAction);
        response.redirect(`${makeRedirectUrl(requestedAction, request)}`);
        return;
    }

    console.log('redirect unknown for', request.originalUrl);
    response.redirect(`${process.env.SCENERY_URL}/#/notfound?redirected=true&origin=${encodeURIComponent(request.originalUrl)}`);
});

module.exports = router;
