import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs-backend-webgl';

import { canvas } from './env';
import { faceDetectionNet, faceDetectionOptions } from './faceDetection';


//algorithm weights
const weightsPath = '/assets/weights';


export async function loadFaceApi() {
	const dirpath = process.env.BASEPATH + weightsPath;

	await faceDetectionNet.loadFromDisk(dirpath);
	await faceapi.nets.faceLandmark68Net.loadFromDisk(dirpath);
	await faceapi.nets.faceExpressionNet.loadFromDisk(dirpath);
}


//image processing
export async function processFrame(baseImg: string) {

	const img = await canvas.loadImage(baseImg);

	const results = await faceapi.detectSingleFace(img as any, faceDetectionOptions)
		.withFaceLandmarks()
		.withFaceExpressions();

	if (results) {//undefined if no facelandmarks detected

		const emotionsObj = results.expressions;
		const dominantEmotion = Object.keys(emotionsObj).find((i) => emotionsObj[i as keyof typeof emotionsObj] === Math.max(...Object.values(emotionsObj)));
		const dominantEmotionPerc = emotionsObj[dominantEmotion as keyof typeof emotionsObj];
		const timestamp: number = Date.now();

		const obj = {
			[timestamp]: {
				dominantEmotion,
				dominantEmotionPerc
			}
		};

		// {
		//   '1667207597822': {
		//     dominantEmotion: 'neutral',
		//     dominantEmotionPerc: 0.8099568486213684
		//   }
		// }
		return obj;

	}
}