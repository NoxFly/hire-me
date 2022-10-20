import { Socket } from 'socket.io';
import { handDetection } from './opencv/webcam';
import server, { io } from './server';

server.start();


io.on('connection', (socket: Socket) => {
    console.info('New socket connected [' + socket.id + ']');

    socket.on('uploadWebcamStream', (data: { stream: String }) => {
        const treatedImage = handDetection(data.stream);
        
        socket.emit('webcamStreamTreated', treatedImage);
    });
});