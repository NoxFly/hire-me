import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs-backend-webgl';

import { canvas } from './env';
import { faceDetectionNet, faceDetectionOptions } from './faceDetection';


//algorithm weights
//@warning replace this absolute path accordingly
const weightsPath = "/home/spacecowboy/Desktop/codes/projet_ihm/src/server/dev/assets/weights";

(async () => {
  await faceDetectionNet.loadFromDisk(weightsPath)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(weightsPath)
  await faceapi.nets.faceExpressionNet.loadFromDisk(weightsPath)
})();
//image processing
export async function processFrame(baseImg: string) {

      const img = await canvas.loadImage(baseImg);

      const results = await faceapi.detectSingleFace(img as any, faceDetectionOptions)
      .withFaceLandmarks()
        .withFaceExpressions()
  
      if(results){//undefined if no facelandmarks detected

        const emotionsObj = results.expressions;
        const dominantEmotion = Object.keys(emotionsObj).find( (i) => emotionsObj[i as keyof typeof emotionsObj] === Math.max( ...Object.values(emotionsObj) ) );
        const dominantEmotionPerc = emotionsObj[dominantEmotion as keyof typeof emotionsObj];
        const timestamp: number = Date.now();
        
        const obj= {
          [timestamp] : {
            dominantEmotion,
            dominantEmotionPerc
          } 
        }

        // {
        //   '1667207597822': {
        //     dominantEmotion: 'neutral',
        //     dominantEmotionPerc: 0.8099568486213684
        //   }
        // }
        return obj;

      }
  }