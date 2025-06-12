import fs from "node:fs";

import bodyParser from "body-parser";
import express from "express";


const app = express();
const SERVER_PORT = 3000;

let musicDir = '/music';
let videoDir = '/video';


function printSyntax() {
  console.log('Syntax:');
  console.log('  node app.js <music dir> <video dir>');
}


function checkSyntax() {
  if (process.argv.length != 4) {
    printSyntax();
    return false;
  }

  return true;
}


// extract music and video directories
if (!checkSyntax()) {
  process.exit(1);
}
musicDir = process.argv[2];
videoDir = process.argv[3];
console.log('music dir: ' + musicDir);
console.log('video dir: ' + videoDir);

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

// ======================== Music ========================

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
  if (!req.query.relativeDirectory) {
    res.status(500).json({ error: 'relativeDirectory argument missing!' });
    return;
  }

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
  if (!req.query.relativeFilePath) {
    res.status(500).send('relativeFilePath argument missing!');
    return;
  }

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

// ======================== Video ========================

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
  if (!req.query.relativeFilePath) {
    res.status(500).send('relativeFilePath argument missing!');
    return;
  }

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

// ======================== Generic ========================

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
