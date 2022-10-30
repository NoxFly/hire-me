// TODO : Amika & Farouk

import { Socket } from 'socket.io';
import server, { io } from '../server';

import {processFrame} from "../dev/common";

let ctr = 0;
//retrieve webcam frame from frontend
io.on("connection", (socket: Socket) => {
    socket.on("uploadWebcamStream", (data: { stream: string }) => {
        ctr++;
        if(ctr < 3){

            console.log("am here in server")
            socket.emit('webcamStreamTreated', processFrame(data.stream));// TODO : treat image with tenserflow
        }
    });
});



