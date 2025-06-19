/**
 * This app reads pure text messages via an input websocket and forwards that text in JSON format
 * to an outgoing websocket. It is used here to pump messages into the parent Angular app.
 * 
 * 
 *                        Notification server (this Javascript app)
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

// E.g. mobile phone client connects here:
serverForIncomingData.on('connection', (server_socket) => {
    socketForIncomingData = server_socket;
    console.log('Client for incoming data connected.');

    socketForIncomingData.on('message', (msg) => {
        console.log('incoming data: ' + msg);
        socketForOutgoingData.send(JSON.stringify({
            message: String(msg),
        }));
    });

    socketForIncomingData.on('close', () => {
        console.log('Client for incoming data disconnected.');
    });
});

// Web frontend connects here:
serverForOutgoingData.on('connection', (server_socket) => {
    socketForOutgoingData = server_socket;
    console.log('Client for outgoing data connected.');

    socketForOutgoingData.on('close', () => {
        console.log('Client for outgoing data disconnected.');
    });
});

console.log('WebSocket server for incoming data (e.g. from mobile phone): ws://localhost:' + INCOMING_DATA_PORT);
console.log('WebSocket server for outgoing data (to web frontend): ws://localhost:' + OUTGOING_DATA_PORT);