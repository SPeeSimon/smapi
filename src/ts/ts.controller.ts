import { Controller, Get, Header, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { ApiTags } from '@nestjs/swagger';

const dns = require('dns');
const http = require('http');
const https = require('https');

const TS = 'TerraSync';
const TERRASYNC_DNS = 'terrasync.flightgear.org';
const HRS_8_IN_SECONDS = 8 * 60 * 60; // 8 hours

export class DnsQueryException extends HttpException {
    constructor() {
        super('Could not retrieve DNS information for terrasync', HttpStatus.SERVICE_UNAVAILABLE);
    }
}

interface FGDnsRequestData {
    url: string;
    index: number;
    address: unknown;
}

interface UrlData {
    url: string;
    data: string;
}

interface TsStatusResponseItem {
    version: string;
    path: string;
    time: string;
    d: Map<string, string>;
}

function getRequestor(url: string) {
    if (url.startsWith('https://')) return https;
    else return http;
}

@ApiTags('Terrasync')
@Controller('ts')
export class TsController {
    async getStatus1(url: string): Promise<UrlData> {
        return new Promise((accept, reject) => {
            getRequestor(url)
                .get(`${url}/.dirindex`, function (response) {
                    if (response.statusCode !== 200) {
                        response.resume();
                        Logger.error(`Error processing ${url}: ${response.statusCode}, ${response.statusMessage}`, TS);
                        return reject({ url: url, error: response.statusMessage || `Remote error ${response.statusCode}` });
                    }

                    let data = '';
                    response.setEncoding('utf8');
                    response.on('data', (chunk) => (data += chunk));
                    response.on('end', () => accept({ url: url, data: data }));
                })
                .on('error', function (err) {
                    Logger.error(`Error processing ${url}: ${err}`, TS);
                    return reject({ url: url, error: err });
                });
        });
    }

    async getAdresses() {
        return dns.promises.resolveNaptr(TERRASYNC_DNS).catch((err) => {
            Logger.log(`DNS resolved in error: ${err}`, TS);
            throw new DnsQueryException();
        });
    }

    private parseDirindex(txt: string) {
        const reply = { d: {} } as TsStatusResponseItem;

        txt.split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 1 && !line.startsWith('#'))
            .map((line) => line.split(':'))
            .forEach((token) => {
                this.writeTokenToStatusResponseItem(token, reply);
            });
        return reply;
    }

    private writeTokenToStatusResponseItem(token: string[], reply: TsStatusResponseItem) {
        switch (token[0]) {
            case 'version':
                reply.version = token[1];
                break;
            case 'path':
                reply.path = token[1] || '/';
                break;
            case 'time':
                reply.time = token.slice(1).join(':');
                break;
            case 'd':
                reply.d[token[1]] = token[2];
                break;
            case 't':
                break;
            default:
                break;
        }
    }

    private getAddressFromNaptrItem(address: any) {
        const separator = address.regexp.charAt(0);
        return address.regexp.split(separator)[2];
    }


    @ApiOperation({ description: "Get a list of available [TerraSync](https://wiki.flightgear.org/TerraSync) mirrors and their status." })
    @ApiOkResponse({ description: 'Successfully retrieved the status of the available TerraSync mirrors' })
    @ApiInternalServerErrorResponse({ description: 'Error during retrieval of the available TerraSync mirrors or getting their status' })
    @Header('Cache-Control', 'public, max-age=' + HRS_8_IN_SECONDS)
    @Get('/status/')
    async getStatus() {
        const addresses = (await this.getAdresses()) || [];
        Logger.log(`DNS resolved in addresses:', ${addresses?.length}`, TS);

        const entries = addresses
            .map((address, index) => {
                const urlMapping = { address: address, url: this.getAddressFromNaptrItem(address), index: index } as FGDnsRequestData;
                Logger.debug(`Got an address/url mapping for: ${urlMapping.url}`, TS);
                return urlMapping;
            })
            .map((data) => {
                return this.getStatus1(data.url).then((u) => {
                    Logger.debug(`Parsing response of: ${data.url}`, TS);
                    return {
                        url: data.url,
                        dirindex: this.parseDirindex(u.data as string),
                        dns: data.address,
                    };
                }).catch((err) => Logger.error(`Error retrieving remote information from "${err.url}" = ${err.error}`, TS));
            })
            .filter(data => data != null)

    
        const terrasyncAddressValues = await Promise.all(entries).catch((err) =>
            Logger.error(`Error retrieving ALL remote information: ${err}`, TS),
        ).then(r => (r as unknown[]).filter(c => c != null));

        return {
            title: 'Terrasync Status',
            entries: terrasyncAddressValues,
        };
    }
}
