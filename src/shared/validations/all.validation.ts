
export class FormChecker {

    /**
     * Checks if the id is a valid model group id
     * @param string idToCheck id to check
     * @return bool true if the given id is a model group id, false otherwise
     */
    public static isModelGroupId(idToCheck) {
        return /^[0-9]+$/.test(idToCheck);
    }
    
    public static isObjectGroupId(idToCheck) {
        return /^[1-9][0-9]*$/.test(idToCheck);
    }

    /**
     * Checks if the id is a valid model id
     * @param string idToCheck id to check
     * @return bool true if the given id is a model id, false otherwise
     */
    public static isModelId(idToCheck) {
        return /^[0-9]+$/u.test(idToCheck) && idToCheck > 0;
    }

    /**
     * Checks if the name is a valid model name (checks if it has only allowed
     * characters)
     * @param string $name name to check
     * @return bool true if the name is a model name, false otherwise
     */
    public static isModelName($name) {
        return /^.+$/.test($name);
    }

    /**
     * Checks if the id is an valid object id value
     * @param string idToCheck
     * @return bool true if the id can be an object
     */
    public static isObjectId(idToCheck) {
        return idToCheck > 0 && /^[0-9]+$/u.test(idToCheck);
    }

    /**
     * Checks if the id is a valid author id
     * @param string idToCheck id to check
     * @return bool true if the id can be an author id, false otherwise
     */
    public static isAuthorId(idToCheck) {
        return idToCheck > 0 && /#^[0-9]{1,3}$#/.test(idToCheck);
    }

    /**
     * Checks if the given variable is a valid latitude
     * @param string $value value to check
     * @return bool true if the value is a valid latitude, false otherwise
     */
    public static isLatitude($value) {
        return $value.length <= 20
               && $value <= 90 && $value >= -90
               && /^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/u.test($value);
    }

    /**
     * Checks if the given variable is a valid longitude
     * @param string $value value to check
     * @return bool true if the value is a valid longitude, false otherwise
     */
    public static isLongitude($value) {
        return $value.length <= 20
               && $value <= 180 && $value >= -180
               && /^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/u.test($value);
    }

    /**
     * Checks if the given parameter is a valid country id
     * @param string $value value to check
     * @return bool true if the given parameter is a valid country id, false otherwise
     */
    public static isCountryId($value) {
        return $value != ""
               && /#^[a-zA-Z]{1,3}$#/.test($value);
    }

    /**
     * Checks if the given variable is a valid ground elevation
     * @param string $value value to check
     * @return bool true if the value is a valid ground elevation
     */
    public static isGndElevation($value) {
        return $value.length <= 20
               && /^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/u.test($value);
    }

    /**
     * Checks if the given variable is a valid offset elevation
     * @param string $value value to check
     * @return bool  if the value is a valid offset elevation
     */
    public static isOffset($value) {
        return $value.length <= 20
               && /^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/u.test($value)
               && $value < 1000 && $value > -1000;
    }

    // Checks if the given variable is a valid heading
    // ================================================
    public static isHeading($value) {
        return $value.length <= 20
               && /^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/u.test($value)
               && $value < 360 && $value >= 0;
    }

    // Checks if the given variable is a valid comment
    // ================================================
    public static isComment($value) {
        return $value.length <= 100
               && /^[^|]+$/u.test($value);
    }

    // Checks if the given variable is a valid email address
    // ================================================
    public static isEmail($value) {
        return $value.length <= 50
               && /^[0-9a-zA-Z_\-.]+@[0-9a-z_\-]+\.[0-9a-zA-Z_\-.]+$/u.test($value);
    }

    /**
     * Checks if the given variable is a valid sig id
     * @param string $value
     * @return bool true if value is a sig, false otherwise
     */
    public static isSig($value) {
        return $value.length == 64
               && /[0-9a-z]/.test($value);
    }
   
    // Checks if the given variable is a AC3D filename
    // ================================================
    public static isAC3DFilename($filename) {
        return /^[a-zA-Z0-9_.-]+\.(ac|AC)$/u.test($filename);
    }
   
    // Checks if the given variable is a PNG filename
    // ================================================
    public static isPNGFilename($filename) {
        return /^[a-zA-Z0-9_.-]+\.(png|PNG)$/u.test($filename);
    }
   
    // Checks if the given variable is a XML filename
    // ================================================
    public static isXMLFilename($filename) {
        return /^[a-zA-Z0-9_.-]+\.(xml|XML)$/u.test($filename);
    }
   
    // Checks if the given variable is a filename
    // ================================================
    public static isFilename($filename) {
        return /^[a-zA-Z0-9_.-]*$/u.test($filename);
    }
   
    /**
     * Checks if the given variable is a valid object text
     * @param string $value value to check
     * @return bool true if the value is a valid object text, false otherwise
     */
    public static isObtext($value) {
        return $value.length > 0
                && $value.length <= 100
                && /^.+$/u.test($value);
    }

    /**
     * Checks if the given value is a filepath
     * @param string $value value to check
     * @return bool true if the value is a filepath, false otherwise
     */
    public static isFilePath($value) {
        return /^[a-z0-9_\/.-]+$/i.test($value);
    }
    
    public static isStgLines($value) {
        return /^[a-zA-Z0-9\_\.\-\,\/]+$/u.test($value);
    }
}
