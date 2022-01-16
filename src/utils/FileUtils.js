const path = require("path");

function getFileExtension(filename) {
  const extension = path.extname(filename);
  if (extension.length > 1 && extension.charAt(0) == ".") {
    return extension.substring(1);
  }
  return filename;
}

/**
 * Transmit a single file from an archive.
 */
class SingleFileTransmitter {
  fileSend = false;
  requestedFile;

  constructor(requestedFile) {
    this.requestedFile = requestedFile;
  }

  doSendFileContent(entry, response, result) {
    response.status(200);
    response.type(getFileExtension(this.requestedFile));
    response.set({
      "Content-Disposition": `filename=${this.requestedFile}`,
      "Last-Modified": result.modified,
    });
    entry.pipe(response); // send request file
    this.fileSend = true;
  }

  processArchiveEntry(entry, response, result) {
    if (entry.path == this.requestedFile) {
      this.doSendFileContent(entry, response, result);
    }
    entry.resume();
  }

  handleClosing(response) {
    if (!this.fileSend) {
      response.status(404).send(`File not found in model archive: ${this.requestedFile}`);
    }
    response.end();
  }
}

module.exports = { SingleFileTransmitter, getFileExtension };
