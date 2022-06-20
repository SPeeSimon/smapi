
class ErrorInfo extends Error {

}

class ModelChecker {

    public is_uploaded_file(file) {
        return true;
    }

    public checkXMLFileArray(arrayXML) {
        var xmlName = arrayXML['name'];
        var exceptions = [];
        
        // if file does not exist
        if (xmlName === "") { 
            return exceptions;
        }
        
        // check if the file is a file uploaded by the user
        if (!this.is_uploaded_file(arrayXML['tmp_name'])) {
            exceptions.push(new ErrorInfo("The XML file was not uploaded by the user"));
        }
        
        // check size file
        if (arrayXML['size'] >= 2000000) {
            exceptions.push(new ErrorInfo(`Sorry, but the size of your XML file "${xmlName}" exceeds 2Mb (current size: ${arrayXML['size']} bytes).`));
        }
        
        // check type
        if (arrayXML['type'] != "text/xml") {
            exceptions.push(new ErrorInfo(`The format of your XML file "${xmlName}" seems to be wrong. XML file needs to be an XML file.`));
        }
        
        // If error is detected
        if (arrayXML['error'] != 0) {
            switch (arrayXML['error']) {
                case 1:
                    exceptions.push(new ErrorInfo(`The file "${xmlName}" is bigger than this server installation allows.`));
                    break;
                case 2:
                    exceptions.push(new ErrorInfo(`The file "${xmlName}" is bigger than this form allows.`));
                    break;
                case 3:
                    exceptions.push(new ErrorInfo(`Only part of the file "${xmlName}" was uploaded.`));
                    break;
                case 4:
                    exceptions.push(new ErrorInfo(`No file "${xmlName}" was uploaded.`));
                    break;
                default:
                    exceptions.push(new ErrorInfo(`There has been an unknown error while uploading the file "${xmlName}".`));
                    break;
            }
        }
        
        return exceptions;
    }
    
    public checkAC3DFileArray(arrayAC) {
        var ac3dName = arrayAC['name'];
        var exceptions = [];
        
        // check if the file is a file uploaded by the user
        if (!this.is_uploaded_file(arrayAC['tmp_name'])) {
            exceptions.push(new ErrorInfo("The AC3D file was not uploaded by the user"));
        }
        
        // check size file
        if (arrayAC['size'] >= 2000000) {
            exceptions.push(new ErrorInfo(`Sorry, but the size of your AC3D file "${ac3dName}" is over 2Mb (current size: ${arrayAC['size']} bytes).`));
        }

        // check type & extension file
        if ((arrayAC['type'] != "application/octet-stream" && arrayAC['type'] != "application/pkix-attr-cert")) {
            exceptions.push(new ErrorInfo(`The format seems to be wrong for your AC3D file "${ac3dName}". AC file needs to be a AC3D file.`));
        }
        
        // If error is detected
        if (arrayAC['error'] != 0) {
            switch (arrayAC['error']){
                case 1:
                    exceptions.push(new ErrorInfo(`The file "${ac3dName}" is bigger than this server installation allows.`));
                    break;
                case 2:
                    exceptions.push(new ErrorInfo(`The file "${ac3dName}" is bigger than this form allows.`));
                    break;
                case 3:
                    exceptions.push(new ErrorInfo(`Only part of the file "${ac3dName}" was uploaded.`));
                    break;
                case 4:
                    exceptions.push(new ErrorInfo(`No file "${ac3dName}" was uploaded.`));
                    break;
                default:
                    exceptions.push(new ErrorInfo(`There has been an unknown error while uploading the file "${ac3dName}".`));
                    break;
            }
        }
        
        return exceptions;
    }
    
    // public checkThumbFileArray(arrayThumb) {
    //     var thumbName = arrayThumb['name'];
    //     var exceptions = [];
        
    //     // check if the file is a file uploaded by the user
    //     if (!this.is_uploaded_file(arrayThumb['tmp_name'])) {
    //         exceptions.push(new ErrorInfo("The thumb file was not uploaded by the user"));
    //     }
        
    //     // check file size
    //     if (arrayThumb['size'] >= 2000000) {
    //         exceptions.push(new ErrorInfo(`Sorry, but the size of your thumbnail file "${thumbName}" exceeds 2Mb (current size: ${_FILES['mo_thumbfile']['size']} bytes).`));
    //     }
        
    //     // check type
    //     if (arrayThumb['type'] != "image/jpeg") { 
    //         exceptions.push(new ErrorInfo(`The file format of your thumbnail file "${thumbName}" seems to be wrong. Thumbnail needs to be a JPEG file.`));
    //     }

    //     // If an error is detected
    //     if (arrayThumb['error'] != 0) {
    //         switch (arrayThumb['error']) {
    //             case 1:
    //                 exceptions.push(new ErrorInfo(`The file "${thumbName}" is bigger than this server installation allows.`));
    //                 break;
    //             case 2:
    //                 exceptions.push(new ErrorInfo(`The file "${thumbName}" is bigger than this form allows.`));
    //                 break;
    //             case 3:
    //                 exceptions.push(new ErrorInfo(`Only part of the file "${thumbName}" was uploaded.`));
    //                 break;
    //             case 4:
    //                 exceptions.push(new ErrorInfo(`No file "${thumbName}" was uploaded.`));
    //                 break;
    //             default:
    //                 exceptions.push(new ErrorInfo(`There has been an unknown error while uploading the file "${thumbName}".`));
    //                 break;
    //         }
    //     }

    //     return exceptions;
    // }
    
    // public checkPNGArray(arrayPNG) {
    //     var pngName = arrayPNG['name'];
    //     var exceptions = [];
        
    //     // check size file
    //     if (arrayPNG['size'] >= 2000000) {
    //         exceptions.push(new ErrorInfo(`Sorry, but the size of your texture file "${pngName}" exceeds 2Mb (current size: ${pngsize} bytes).`));
    //     }
        
    //     // check type
    //     if (arrayPNG['type'] != 'image/png') {
    //         exceptions.push(new ErrorInfo(`The format of your texture file "${pngName}" seems to be wrong. Texture file needs to be a PNG file.`));
    //     }
            
        
    //     // If error is detected
    //     if (arrayPNG['error'] != 0) {
    //         switch (arrayPNG['error']) {
    //             case 1:
    //                 exceptions.push(new ErrorInfo(`The file "${pngName}" is bigger than this server installation allows.`));
    //                 break;
    //             case 2:
    //                 exceptions.push(new ErrorInfo(`The file "${pngName}" is bigger than this form allows.`));
    //                 break;
    //             case 3:
    //                 exceptions.push(new ErrorInfo(`Only part of the file "${pngName}" was uploaded.`));
    //                 break;
    //             case 4:
    //                 exceptions.push(new ErrorInfo(`No file "${pngName}" was uploaded.`));
    //                 break;
    //             default:
    //                 exceptions.push(new ErrorInfo(`There has been an unknown error while uploading the file "${pngName}".`));
    //                 break;
    //         }
    //     }
        
    //     return exceptions;
    // }
    
    // /**
    //  * Opens a working directory for the new uploaded model.
    //  * 
    //  * @param type $parentDir path.
    //  * @return string new directory path.
    //  * @throws Exception
    //  */
    // public openWorkingDirectory(parentDir) {
    //     var targetPath = parentDir + "/static_" + Math.random() + "/";
    //     while (file_exists(targetPath)) {
    //         // Makes concurrent access impossible: the script has to wait if this directory already exists.
    //         usleep(500);
    //     }

    //     if (!mkdir(targetPath)) {
    //         throw new Error("Impossible to create temporary directory " + targetPath);
    //     }
        
    //     return targetPath;
    // }
    
    // public dos2Unix(filePath) {
    //     // Dos2unix file
    //     system('dos2unix ' + filePath);
    // }
    
    // /**
    //  * Create an base 64 encoded Tar GZ archive from the given model folder path.
    //  * @param string $modelFolderPath model
    //  * @return base 64 archive of model
    //  */
    // public archiveModel(modelFolderPath) {
    //     var tmpDir = sys_get_temp_dir();
        
    //     // Create, fill archive file and compress it
    //     var phar = new PharData(tmpDir . '/model.tar');
    //     phar.buildFromDirectory(modelFolderPath);
    //     phar.compress(Phar::GZ);
        
    //     // Delete archive file
    //     unlink(tmpDir + '/model.tar');
    //     // Rename compress file
    //     rename(tmpDir + '/model.tar.gz', tmpDir + '/model.tgz');

    //     var $handle    = fopen(tmpDir + "/model.tgz", "r");
    //     var $contents  = fread($handle, filesize(tmpDir + "/model.tgz"));
    //     fclose($handle);
    //     unlink(tmpDir + '/model.tgz');
        
    //     // Dump & encode the file
    //     return base64_encode($contents);
    // }
}
