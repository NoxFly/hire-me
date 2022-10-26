import { Socket } from 'socket.io';
import server, { io } from './server';
import { connections } from './database';
import { generateToken, parseCookie } from './utils';

const tokenKey = 'HM-AuthToken';
const cookieMaxAge = 43200; // seconds. Means it's 12



server.start();



io.on('connection', (socket: Socket) => {
    // AUTHENTICATION
    const cookie = parseCookie(socket.handshake.headers.cookie?? '');

    if(cookie[tokenKey] && connections.has(cookie[tokenKey] as string)) {
        connections.set(cookie[tokenKey] as string, socket.id);
    }
    else {
        const token = generateToken();
        connections.set(token, socket.id);
        socket.emit('authenticate', { tokenKey, token, cookieMaxAge });
    }
    // ----




    socket.on('uploadWebcamStream', (data: { stream: String }) => { // base64 img
        const treatedImage = data.stream; // TODO : treat image with tenserflow
        
        socket.emit('webcamStreamTreated', treatedImage);
    });
});