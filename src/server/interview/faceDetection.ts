import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-node';

import * as canvas from 'canvas';

import { Emotion, EmotionMap, emptyEmotionMap } from '~/server/interview/Emotion';


//algorithm weights
const weightsPath = '/assets/weights';


// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;


faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);


const faceDetectionNet = faceapi.nets.tinyFaceDetector;
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 160;
const scoreThreshold = 0.5;


const faceDetectionOptions = getFaceDetectorOptions();



function getFaceDetectorOptions() {
	return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}


export async function loadFaceApi() {
	const dirpath = process.env.BASEPATH + weightsPath;

	await faceDetectionNet.loadFromDisk(dirpath);
	await faceapi.nets.faceLandmark68Net.loadFromDisk(dirpath);
	await faceapi.nets.faceExpressionNet.loadFromDisk(dirpath);
}


// image processing
// returns an array of evaluated expressions of the given visage as image
// if no visage neither expression is found, then returns an empty array
// the expressions are sorted by intensity / perc
export async function processFrame(baseImg: string): Promise<EmotionMap> {
    const res: EmotionMap = emptyEmotionMap();

	const img = await canvas.loadImage(baseImg);

	const results = await faceapi.detectSingleFace(img as any, faceDetectionOptions)
		.withFaceLandmarks()
		.withFaceExpressions();

	if(!results) { // undefined if no facelandmarks detected
        return res;
    }

    const emotions = results.expressions;

    const sortedEmotions = (Object.entries(emotions) as Array<[Emotion, number]>)
        .filter(e => e[1] > 0)
        .sort((a, b) => a[1] > b[1]? -1 : 1); // [max, ..., min]

    sortedEmotions.forEach(emotion => {
        res[emotion[0]] = Math.floor(emotion[1] * 100) / 100;
    });

    return res;
}