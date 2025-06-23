import fs from "node:fs";

import bodyParser from "body-parser";
import express from "express";
import { fileURLToPath } from "url";

// =================== Working directory ===================

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file

let appDir = undefined;

function initAppDir() {
  appDir = __filename.replaceAll('\\', '/');
  //console.log('appDir: ' + appDir);
  const lastSlash = appDir.lastIndexOf('/');
  appDir = appDir.substring(0, lastSlash);
  //console.log('appDir: ' + appDir);
}

initAppDir();

// =================== Logging ===================

const LOG_PREFIX = '[MEDIA_SERVER]';
const LOG_FILE_BASE_NAME = 'mediaServer.log'; // stored in directory of this app; overwritten with 10 files roundtrip
const LOG_FILE_NUMBER_FILENAME = 'mediaServer.log.number';
let logFilename = undefined;

/**
 * @param strNumber 
 * @returns strNumber + 1
 */
function stringIncrement(strNumber) {
  const number = parseInt(strNumber, 10);
  return String((number + 1) % 10);
}

/**
 * Set logFile, based on LOG_FILENAME and LOG_FILE_NUMBER_FILENAME.
 */
function initLogFilename() {
  // get log file number
  let oldLogFileNumber = undefined;
  try {
    oldLogFileNumber = fs.readFileSync(appDir + '/' + LOG_FILE_NUMBER_FILENAME, 'utf8');
  } catch (err) {
    oldLogFileNumber = '9'; // subsequentially inits logFileNumber to '0'
  }
  //console.log('oldLogFileNumber: ' + oldLogFileNumber);
  const logFileNumber = stringIncrement(oldLogFileNumber);
  fs.writeFileSync(appDir + '/' + LOG_FILE_NUMBER_FILENAME, logFileNumber); // save for next run

  // set logFile
  logFilename = appDir + '/' + LOG_FILE_BASE_NAME + '.' + logFileNumber;
  //console.log('logFilename: ' + logFilename);
}

initLogFilename();

/**
 * Appends str to logFile and wites it to the console.
 * 
 * @param str 
 */
function log(str) {
    const logstr = LOG_PREFIX + ' ' + str;
    console.log(logstr);
    if (logFilename !== undefined) {
      fs.writeFileSync(logFilename, logstr + '\n', {flag: 'a'});
    }
}

// =================== Syntax ===================

function printSyntax() {
  log('Syntax:');
  log('  node app.js <music dir> <video dir>');
}

function checkSyntax() {
  if (process.argv.length != 4) {
    printSyntax();
    return false;
  }

  return true;
}

// =================== App start ===================

const app = express();
const SERVER_PORT = 3000;

let musicDir = '/music';
let videoDir = '/video';

// extract music and video directories
if (!checkSyntax()) {
  process.exit(1);
}
musicDir = process.argv[2];
videoDir = process.argv[3];
log('music dir: ' + musicDir);
log('video dir: ' + videoDir);

// JSON parser
app.use(bodyParser.json());

/**
 * CORS HTTP header adjustments.
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

// ------------------------ Music ------------------------
   
/**
 * /music/showFolder
 * 
 * @param relativeDirectory Directory relative to the local music directory.
 * @return The names of the directories and files contained in relativeDirectory, in JSON,
 *         in the form
 *           {
 *             directories: ['dir1', ...],
 *             files: ['file1', ...]
 *           }
 * 
 * Example:
 *   http://localhost:3000/music/showFolder?relativeDirectory=.
 */ 
app.get("/music/showFolder", (req, res) => {
  log('Request: /music/showFolder');
  if (!req.query.relativeDirectory) {
    res.status(500).json({ error: 'relativeDirectory argument missing!' });
    return;
  }
  log('  relativeDirectory: ' + req.query.relativeDirectory);

  // extract files from relative directory
  const path = musicDir + '/' + req.query.relativeDirectory;
  let dirs = [];
  let files = [];
  fs.readdirSync(path).forEach(entry => {
    if (fs.lstatSync(path + '/' + entry).isDirectory()) {
      dirs.push(entry);
    }
    if (fs.lstatSync(path + '/' + entry).isFile()) {
      files.push(entry);
    }
  });

  res.status(200).json({
    directories: dirs,
    files: files,
  });
  return;
});


/**
 * /music/stream
 * 
 * @param relativeFilePath Relative file path (relative to the local music directory)
 *                         to a local music file.
 * @return That file.
 * 
 * Example:
 *   http://localhost:3000/music/stream?relativeFilePath=80er\Piano%20Band\Piano.mp3
 */
app.get("/music/stream", (req, res) => {
  log('Request: /music/stream');
  if (!req.query.relativeFilePath) {
    res.status(500).send('relativeFilePath argument missing!');
    return;
  }
  log('  relativeFilePath: ' + req.query.relativeFilePath);

  // do not allow ".." substrings, so that files from other places cannot be accessed
  if (req.query.relativeFilePath.includes('..')) {
    res.status(500).send('relativeFilePath is invalid!');
    return;
  }

  const absoluteFilePath = musicDir + '/' + req.query.relativeFilePath;
  res.sendFile(absoluteFilePath, (err) => {
    if (err) {
      //console.log('Problem sending file ' + absoluteFilePath + ': ' + err);
      res.status(500).send('Problem sending file ' + req.query.relativeFilePath + ': ' + err);
      return;
    } else {
      //console.log('File sent successfully: ' + absoluteFilePath);
      return;
    }
  });
});

// ------------------------ Video ------------------------

/**
 * /video/showFolder
 * 
 * @return The names of the files contained in the global video directory, in JSON,
 *         in the form
 *           {
 *             files: ['file1', ...]
 *           }
 * 
 * Example:
 *   http://localhost:3000/video/showFolder
 */ 
app.get("/video/showFolder", (req, res) => {
  log('Request: /video/showFolder');
  // extract files
  let files = [];
  fs.readdirSync(videoDir).forEach(entry => {
    if (fs.lstatSync(videoDir + '/' + entry).isDirectory()) {
      ; // skip directories
    }
    if (fs.lstatSync(videoDir + '/' + entry).isFile()) {
      files.push(entry);
    }
  });

  res.status(200).json({
    files: files,
  });
  return;
});


/**
 * /video/stream
 * 
 * @param relativeFilePath Relative file path (relative to the local video directory)
 *                         to a local video file.
 * @return That file.
 * 
 * Example:
 *   http://localhost:3000/video/stream?relativeFilePath=80er\Piano%20Band\Piano.mp4
 */
app.get("/video/stream", (req, res) => {
  log('Request: /video/stream');
  if (!req.query.relativeFilePath) {
    res.status(500).send('relativeFilePath argument missing!');
    return;
  }
  log('  relativeFilePath: ' + req.query.relativeFilePath);

  // do not allow ".." substrings, so that files from other places cannot be accessed
  if (req.query.relativeFilePath.includes('..')) {
    res.status(500).send('relativeFilePath is invalid!');
    return;
  }

  const absoluteFilePath = videoDir + '/' + req.query.relativeFilePath;
  res.sendFile(absoluteFilePath, (err) => {
    if (err) {
      //console.log('Problem sending file ' + absoluteFilePath + ': ' + err);
      return;
    } else {
      //console.log('File sent successfully: ' + absoluteFilePath);
      return;
    }
  });
});

// ------------------------ Generic ------------------------

/**
 * Fallback to error 404 for remaining requests.
 */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});


// start HTTP server
app.listen(SERVER_PORT);
log('Listening at port ' + SERVER_PORT);
