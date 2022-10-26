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

import {run} from "../dev/common";
import {base64Img} from '../dev/assets/images/base64_test';
//commons
import {saveFile} from "../dev/common/saveFile";
import {faceDetectionNet, faceDetectionOptions} from "../dev/common/faceDetection";

//retrieve webcam frame from frontend
io.on("connection", (socket: Socket) => {
    socket.on("uploadWebcamStream", (data: { stream: String }) => {//base64
      
        const treatedImage = data.stream; // TODO : treat image with tenserflow
    
        //socket.emit('webcamStreamTreated', treatedImage);
    });
});


  
console.log(run("base64image"));
