/* ================ CONFIGURATION ================ */

const cameraConstraints = {
    audio: false,
    video: {
        width: 1280,
        height: 720,
        facingMode: 'user'
    }
};


// recover all DOM <elements>
const $webcam = document.getElementById('webcam-stream'); // default video webcam output
const $analyzedWebcam = document.getElementById('stream-result'); // server-treated stream output
const $canvasImg = $analyzedWebcam.querySelector('img'); // The img inside, which the output will be drawn

// create a canvas which will serve as a buffer
// (get webcam stream through the image) -> draw it through the canvas -> export canvas as base64 -> send it to the server
const $canvas = document.createElement('canvas');
const ctx = $canvas.getContext('2d');

// make the canvas dimensions the same as the webcam's
// internal treatment dimensions
$canvas.width = cameraConstraints.video.width;
$canvas.height = cameraConstraints.video.height;
// visual dom (css) dimensions
$canvas.style.width = $canvas.width;
$canvas.style.height = $canvas.height;

// frame rating of how much data is sent to the server
// [10,30] recommended during development
// 50 recommended for release
let fps = 24;




/* ================ SOCKET.IO LISTENERS ================ */


// tells the socket to listen the 'webcamStreamTreated' event from the server
// the callbacks handles a data (here a string, the base64 treated image)
socket.on('webcamStreamTreated', data => {
    //no needed as we are not retrieving the proccesed image
   // $canvasImg.src = `${data}`;
});





/* ================ FUNCTIONS ================ */


/**
 * Asks the navigator to get the user's webcam.
 * Throws an error if not available or refused.
 * Async function : returns a promise which needs an 'await' when called.
 * @param {MediaStreamConstraints} constraints 
 * @returns {Promise<MediaStream>}
 */
function getMedia(constraints) {
    try {
        return navigator.mediaDevices.getUserMedia(constraints);
    } catch(err) {
        throw new Error(err);
    }
}

/**
 * Loops the stream and the socket calls to treat the stream.
 * @param {MediaStream} webcam 
 */
function processImage(webcam) {
    // update the main video
    $webcam.srcObject = webcam;
    $webcam.play();

    // clear interval when interview ends 
    const intervalJob = setInterval( () => {
        socket.emit('uploadWebcamStream', { stream: takepicture() });
    }, 1000);
}

/**
 * 'Screenshots' the stream.
 * Cannot use new methods of the webcam, because it's currently not supported by any browser (too new).
 * Thus we'll get a lack of performances when screenshoting manually the stream.
 * @returns {String}
 */
function takepicture() {
    ctx.drawImage($webcam, 0, 0, $canvas.width, $canvas.height);
    return $canvas.toDataURL('image/jpeg'); // base64 encoded
}






/* ================ EXECUTION ================ */

// get webcam then process image if succeed.
getMedia(cameraConstraints)
    .then(processImage)
    .catch(e => console.error("Failed to get the webcam media.", e));