/**
 * This app is a bridge, forwarding JSON-formatted messages between a
 * mobile device (e.g. an Android phone) (port 8081) and a web frontend
 * (e.g. an Angular-based internet radio) (port 8082).
 * 
 * It can be used e.g. to send commands from a mobile phone to an
 * internet radio and to forward potential replies from the internet
 * radio back to the mobile phone.
 * 
 * Example szenario 1, phone sends text message to the internet radio:
 * 
 *                                 Command server (this Javascript app)
 *                               ^                                      |
 *                               | (server, port 8081)                  | (server, port 8082)
 *                               |                                      |
 * (1) {"notification": "Hello"} | websocket                            | websocket (2) {"notification": "Hello"}
 *                               |                                      |
 *                               | (client)                             | (client)
 *                               |                                      v
 *                         Mobile phone                        Internet radio (Angular web frontend)
 * 
 * 
 * Example szenario 2, internet radio sends status to phone:
 * 
 *                            Command server (this Javascript app)
 *                          |                                      ^
 *                          | (server, port 8081)                  | (server, port 8082)
 *                          |                                      |
 *                          | websocket                            | websocket  
 *  (2) {"status":          |                                      |  (1) {"status":
 *        {"app": "radio1"} |                                      |        {"app": "radio1"}
 *      }                   |                                      |      }
 *                          |                                      |
 *                          | (client)                             | (client)
 *                          v                                      |
 *                    Mobile phone                        Internet radio (Angular web frontend)
 * 
 * To start this app, go to this directory and run  
 *         `node app.js`
 */

import { WebSocketServer } from 'ws';
import { fileURLToPath } from "url";
import { RoundTripLogger } from "../shared/server_log/server_log.js";

// =================== Logging ===================

const LOG_PREFIX = '[COMMAND_SERVER]';
const LOG_FILE_BASE_NAME = 'commandServer.log';
let logger = new RoundTripLogger(fileURLToPath(import.meta.url), LOG_FILE_BASE_NAME, LOG_PREFIX);

// =================== App start ===================

const MOBILE_DEVICE_PORT = 8081; // to/from mobile device
const INTERNET_RADIO_PORT = 8082; // to/from internet radio web frontend

const serverForMobileDevice = new WebSocketServer({ 
  port: MOBILE_DEVICE_PORT,
});
let socketForMobileDevice = null;

const serverForInternetRadio = new WebSocketServer({ 
  port: INTERNET_RADIO_PORT,
});
let socketForInternetRadio = null;


// E.g. mobile phone client connects here:
serverForMobileDevice.on('connection', (server_socket) => {
    socketForMobileDevice = server_socket;
    logger.log('Client for mobile device connected.');

    socketForMobileDevice.on('message', (msg) => {
        logger.log('From mobile device: ' + msg);
        try {
            socketForInternetRadio.send(JSON.stringify(String(msg)));
        } catch (e) {
            logger.log('Error sending message to internet radio socket: ' + e);
        }
    });

    socketForMobileDevice.on('close', () => {
        logger.log('Client for mobile device disconnected.');
    });
});

// Internet radio web frontend connects here:
serverForInternetRadio.on('connection', (server_socket) => {
    socketForInternetRadio = server_socket;
    logger.log('Client for internet radio connected.');

    socketForInternetRadio.on('message', (msg) => {
        logger.log('From internet radio: ' + msg);
        try {
            socketForMobileDevice.send(JSON.stringify(String(msg)));
        } catch (e) {
            logger.log('Error sending message to mobile device socket: ' + e);
        }
    });

    socketForInternetRadio.on('close', () => {
        logger.log('Client for internet radio disconnected.');
    });
});

logger.log('WebSocket server for mobile device: ws://localhost:' + MOBILE_DEVICE_PORT);
logger.log('WebSocket server for internet radio: ws://localhost:' + INTERNET_RADIO_PORT);