/**
 * This app reads pure text messages as well as JSON-formatted commands via an input
 * websocket and forwards the text / commands in JSON format to an outgoing websocket.
 * It is used here to pump messages into the parent Angular app.
 * 
 * 
 *                          Command server (this Javascript app)
 *                        ^                                      |
 *                        | (server, port 8081)                  | (server, port 8082)
 *                        |                                      |
 *           "Hello"      | websocket                            | websocket            {message: "Hello"}
 *                        |                                      |
 *                        | (client)                             | (client)
 *                        |                                      v
 *       Messsage source, e.g. mobile phone                  Message sink: Angular web frontend
 * 
 * 
 * To start this app, go to this directory and run  
 *         `node app.js`
 */

import { WebSocketServer } from 'ws';

const LOG_PREFIX = '[NOTIFICATION_SERVER]';

const INCOMING_DATA_PORT = 8081; // text input, e.g. from mobile phone
const OUTGOING_DATA_PORT = 8082; // to web frontend

const serverForIncomingData = new WebSocketServer({ 
  port: INCOMING_DATA_PORT,
});
let socketForIncomingData = null;

const serverForOutgoingData = new WebSocketServer({ 
  port: OUTGOING_DATA_PORT,
});
let socketForOutgoingData = null;

function log(str) {
    console.log(LOG_PREFIX + ' ' + str);
}

// E.g. mobile phone client connects here:
serverForIncomingData.on('connection', (server_socket) => {
    socketForIncomingData = server_socket;
    log('Client for incoming data connected.');

    socketForIncomingData.on('message', (msg) => {
        log('Incoming data: ' + msg);
        try {
            socketForOutgoingData.send(JSON.stringify({
                message: String(msg),
            }));
        } catch (e) {
            log('Error sending message to outgoing socket: ' + e);
        }
    });

    socketForIncomingData.on('close', () => {
        log('Client for incoming data disconnected.');
    });
});

// Web frontend connects here:
serverForOutgoingData.on('connection', (server_socket) => {
    socketForOutgoingData = server_socket;
    log('Client for outgoing data connected.');

    socketForOutgoingData.on('close', () => {
        log('Client for outgoing data disconnected.');
    });
});

log('WebSocket server for incoming data (e.g. from mobile phone): ws://localhost:' + INCOMING_DATA_PORT);
log('WebSocket server for outgoing data (to web frontend): ws://localhost:' + OUTGOING_DATA_PORT);