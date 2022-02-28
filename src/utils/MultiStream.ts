const stream = require("stream");

export interface MultiStreamOptions {
  highWaterMark?;
  encoding?;
  objectMode?: boolean;
}

export class MultiStream extends stream.Readable {
  _object: unknown;

  constructor(private object: Buffer | string, private options?: MultiStreamOptions) {
    super(Object.assign({}, 
                  {objectMode: !(object instanceof Buffer || typeof object === "string")},
                  options));
    this._object = object;
  }

  _read() {
    super.push(this._object);
    this._object = null;
  }
}
