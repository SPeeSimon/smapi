const zlib = require('zlib');

const GZIP_COMPRESSION_LEVEL = 8;

export class Zipped64 {
    /**
     * Convert a JSON object into a compact Base64.
     * The object is first compacted with gzip and then turned into a base64 string.
     * @param content The object to convert
     * @returns A string with the value in base64
     */
    static encodeJSON(content: any) {
        return Buffer.from(zlib.gzipSync(content, { level: GZIP_COMPRESSION_LEVEL })).toString('base64');
    }

    /**
     * Convert a base64 compact string into a JSON object.
     * The base64 string is turned into binary, then gunzip is unpacking the value which is then parsed as a JSON object.
     * @param zipped a compact base64 string
     * @returns The JSON object that was encoded into the string. Or an error.
     */
    static decodeJSON(zipped: string) {
        return JSON.parse(zlib.unzipSync(Buffer.from(zipped, 'base64')).toString());
    }
}
