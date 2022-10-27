import * as faceapi from 'face-api.js';

import { canvas } from './env';
import { faceDetectionNet, faceDetectionOptions } from './faceDetection';
import { saveFile } from './saveFile';

import {base64Img} from "../assets/images/base64_test"//this is tmp and should be replaced with value retrieved from socket


//algorithm weights
//@warning replace this absolute path accordingly
const weightsPath = "/home/spacecowboy/Desktop/codes/projet_ihm/src/server/dev/assets/weights";

//image processing
export async function processFrame(baseImg: string) {

    await faceDetectionNet.loadFromDisk(weightsPath)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(weightsPath)
    await faceapi.nets.faceExpressionNet.loadFromDisk(weightsPath)
  
    //base64Img should be replaced with baseImg
    const img = await canvas.loadImage(base64Img);

    const results = await faceapi.detectAllFaces(img as any, faceDetectionOptions)
    .withFaceLandmarks()
      .withFaceExpressions()
  
    //this part draws the effects on top of our input frame
    const out = faceapi.createCanvasFromMedia(img as any) as any
    faceapi.draw.drawDetections(out, results.map(res => res.detection))
    faceapi.draw.drawFaceExpressions(out, results)
    
    saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))

    return out.toDataURL();
  }