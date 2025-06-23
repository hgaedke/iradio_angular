import fs from "node:fs";

export class RoundTripLogger {
  /**
   * @param appFilePath Absolute file path.
   * @param logFileBaseName The base name for the log files; ".<number>" will be appended.
   * @param logPrefix Prefix string for log messages.
   */
  constructor(appFilePath, logFileBaseName, logPrefix) {
    this.appDir = this.getAppDir(appFilePath);
    this.logFileBaseName = logFileBaseName;
    this.logPrefix = logPrefix;
    this.logFilename = this.initLogFilename(this.appDir, this.logFileBaseName);
  }

  /**
   * @param appFilePath Absolute file path.
   * @returns The absolute path (using slashes) of the directory in which appFilePath is in.
   */
  getAppDir(appFilePath) {
    let appDirLocal = appFilePath.replaceAll('\\', '/');
    //console.log('appDirLocal: ' + appDirLocal);
    const lastSlash = appDirLocal.lastIndexOf('/');
    appDirLocal = appDirLocal.substring(0, lastSlash);
    //console.log('appDirLocal: ' + appDirLocal);
    return appDirLocal;
  }

  /**
   * @param strNumber 
   * @returns strNumber + 1
   */
  stringIncrement(strNumber) {
    const number = parseInt(strNumber, 10);
    return String((number + 1) % 10);
  }

  /**
   * Determines logFile, based on logDir and logFileBaseName.
   * 
   * WARNING: Overwrites the logFileNumber file inside directory logDir to store which logfil
   * is currently used, and initially clears the logfile!
   * 
   * @param logDir The absolute path of the directory where to store log files.
   * @param logFileBaseName The base name for the log files; ".<number>" will be appended.
   * @return The absolute path of the logfile to use.
   */
  initLogFilename(logDir, logFileBaseName) {
    const logFileNumberFilename = logFileBaseName + '.number';

    // get log file number
    let oldLogFileNumber = undefined;
    try {
      oldLogFileNumber = fs.readFileSync(logDir + '/' + logFileNumberFilename, 'utf8');
    } catch (err) {
      oldLogFileNumber = '9'; // subsequentially inits logFileNumber to '0'
    }
    //console.log('oldLogFileNumber: ' + oldLogFileNumber);
    const logFileNumber = this.stringIncrement(oldLogFileNumber);
    fs.writeFileSync(logDir + '/' + logFileNumberFilename, logFileNumber); // save for next run

    // determine logFile
    const logFilenameLocal = logDir + '/' + logFileBaseName + '.' + logFileNumber;
    //console.log('logFilenameLocal: ' + logFilenameLocal);

    // clear logfile
    try {
      fs.rmSync(logFilenameLocal);
    } catch (e) {
      ; // error because file does not exist => no problem
    }

    return logFilenameLocal;
  }

  /**
   * Appends str to logFile (file with name logFilename) and wites it to the console.
   * 
   * @param str 
   */
  log(str) {
      const logstr = this.logPrefix + ' ' + str;
      console.log(logstr);
      if (this.logFilename !== undefined) {
        fs.writeFileSync(this.logFilename, logstr + '\n', {flag: 'a'});
      }
  }
}

