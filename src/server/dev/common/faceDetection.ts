import * as faceapi from 'face-api.js';

export const faceDetectionNet = faceapi.nets.tinyFaceDetector;
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 160
const scoreThreshold = 0.5

function getFaceDetectorOptions() {
  return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

export const faceDetectionOptions = getFaceDetectorOptions()
