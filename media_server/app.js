import fs from "node:fs";

import bodyParser from "body-parser";
import express from "express";

// ===================================
// start (in media_server/):
// node app.js "e:/Programmieren/Internetradio Raspberry Pi/music" videoDir
// ===================================

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
  //res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});


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
app.get("/music/showFolder", async (req, res) => {
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
app.get("/music/stream", async (req, res) => {
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
      console.log('Problem sending file ' + absoluteFilePath + ': ' + err);
      res.status(500).send('Problem sending file ' + req.query.relativeFilePath + ': ' + err);
    } else {
      console.log('File sent successfully: ' + absoluteFilePath);
      res.status(200).send();
    }
  });
});


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
