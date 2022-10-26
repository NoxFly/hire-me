// TODO : Amika & Farouk

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
//import '@tensorflow/tfjs-node';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
// import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import {canvas} from "../dev/common/env";

import { Socket } from 'socket.io';
import server, { io } from '../server';

import {processFrame} from "../dev/common";

//retrieve webcam frame from frontend
io.on("connection", (socket: Socket) => {
    socket.on("uploadWebcamStream", (data: { stream: String }) => {
        //socket.emit('webcamStreamTreated', processFrame(data.stream));// TODO : treat image with tenserflow
    });
});


  
console.log(processFrame("base64image"));//this should go in the socket callback eventully
