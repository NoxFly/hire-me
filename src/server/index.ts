import { Socket } from 'socket.io';
import server, { io } from './server';
//import * as ts from '@tensorflow/tfjs-node';

server.start();


io.on('connection', (socket: Socket) => {
    console.info('New socket connected [' + socket.id + ']');

    socket.on('uploadWebcamStream', (data: { stream: String }) => { // base64 img
        const treatedImage = data.stream; // TODO : treat image with tenserflow
        
        socket.emit('webcamStreamTreated', treatedImage);
    });
});