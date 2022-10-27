// TODO : Amika & Farouk

import { Socket } from 'socket.io';
import server, { io } from '../server';

import {processFrame} from "../dev/common";

//retrieve webcam frame from frontend
io.on("connection", (socket: Socket) => {
    socket.on("uploadWebcamStream", (data: { stream: String }) => {
        //socket.emit('webcamStreamTreated', processFrame(data.stream));// TODO : treat image with tenserflow
    });
});


(async () => {
    console.log(await processFrame("base64image"))
})();
