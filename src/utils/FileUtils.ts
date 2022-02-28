import { Response } from "express";
const path = require("path");

export function getFileExtension(filename: string) {
  const extension = path.extname(filename);
  if (extension.length > 1 && extension.charAt(0) == ".") {
    return extension.substring(1);
  }
  return filename;
}


/**
 * Transmit a single file from an archive.
 */
export class SingleFileTransmitter {
  fileSend = false;
  filter: (n: string) => boolean;

  constructor() {
    this.filter = (x: string) => true;
  }

  public withFileFilter(requestedFile: (n: string) => boolean) {
    this.filter = requestedFile;
    return this;
  }

  private doSendFileContent(entry, response: Response, lastModified: Date) {
    response.status(200);
    response.type(getFileExtension(entry.path));
    response.set({
      "Content-Disposition": `filename=${entry.path}`,
      "Last-Modified": lastModified,
    });
    entry.pipe(response); // send request file
    this.fileSend = true;
  }

  public processArchiveEntry(entry, response: Response, lastModified: Date) {
    if (this.filter(entry.path)) {
      this.doSendFileContent(entry, response, lastModified);
    }
    entry.resume();
  }

  public handleClosing(response: Response) {
    if (!this.fileSend) {
      response.status(404).send(`File not found in model archive`);
    }
    response.end();
  }
}
