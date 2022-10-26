import * as faceapi from 'face-api.js';

import { canvas } from './env';
import { faceDetectionNet, faceDetectionOptions } from './faceDetection';
import { saveFile } from './saveFile';

import {base64Img} from "../assets/images/base64_test"


//algorithm weights
const weightsPath = "/home/spacecowboy/Desktop/codes/projet_ihm/src/server/dev/assets/weights";

//image processing
export async function run(baseImg: string) {

    await faceDetectionNet.loadFromDisk(weightsPath)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(weightsPath)
    await faceapi.nets.faceExpressionNet.loadFromDisk(weightsPath)
  
    //const img = await canvas.loadImage('/home/spacecowboy/Desktop/codes/projet_ihm/src/server/dev/assets/images/surprised.jpg')
    //const img = await faceapi.fetchImage('/home/spacecowboy/Desktop/codes/projet_ihm/src/server/dev/assets/images/surprised.jpg');
    const img = await canvas.loadImage(base64Img);
    //console.log('am base64 img', img);

    const results = await faceapi.detectAllFaces(img as any, faceDetectionOptions)
    .withFaceLandmarks()
      .withFaceExpressions()
  
    const out = faceapi.createCanvasFromMedia(img as any) as any
    faceapi.draw.drawDetections(out, results.map(res => res.detection))
    faceapi.draw.drawFaceExpressions(out, results)
    
    return out.toDataURL();
  }