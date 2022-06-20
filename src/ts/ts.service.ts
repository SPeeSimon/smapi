import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

const dns = require('dns');
const http = require('http');
const https = require('https');

export const TS = 'TerraSync';
const TERRASYNC_DNS = 'terrasync.flightgear.org';

export class DnsQueryException extends HttpException {
    constructor() {
        super('Could not retrieve DNS information for terrasync', HttpStatus.SERVICE_UNAVAILABLE);
    }
}

export interface FGDnsRequestData {
    url: string;
    index: number;
    address: unknown;
}

export interface UrlData {
    url: string;
    data: string;
}

export interface TsStatusResponseItem {
    version: string;
    path: string;
    time: string;
    d: Map<string, string>;
}

function getRequestor(url: string) {
    if (url.startsWith('https://')) return https;
    else return http;
}

@Injectable()
export class TsService {
    public async getEntries() {
        const addresses = (await this.getAdresses()) || [];
        Logger.log(`DNS resolved in addresses:', ${addresses?.length}`, TS);

        const entries = addresses
            .map((address, index) => this.mapToAddressWithNaptr(address, index))
            .map((data) => this.mapToAddressWithInfo(data))
            .filter((data) => data != null);
        return entries;
    }

    private mapToAddressWithNaptr(address, index): FGDnsRequestData {
        const urlMapping = { address: address, url: this.getAddressFromNaptrItem(address), index: index } as FGDnsRequestData;
        Logger.debug(`Got an address/url mapping for: ${urlMapping.url}`, TS);
        return urlMapping;
    }

    private mapToAddressWithInfo(data) {
        return this.getStatus(data.url)
            .then((u) => {
                Logger.debug(`Parsing response of: ${data.url}`, TS);
                return {
                    url: data.url,
                    dirindex: this.parseDirindex(u.data as string),
                    dns: data.address,
                };
            })
            .catch((err) => Logger.error(`Error retrieving remote information from "${err.url}" = ${err.error}`, TS));
    }

    async getStatus(url: string): Promise<UrlData> {
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

    private async getAdresses() {
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
}
