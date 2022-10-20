const cameraConstraints = {
    audio: false,
    video: {
        width: 1280,
        height: 720,
        facingMode: 'user'
    }
};



const $webcam = document.getElementById('webcam-stream');
const $analyzedWebcam = document.getElementById('stream-result');
const $canvasImg = $analyzedWebcam.querySelector('img');
const $canvas = document.createElement('canvas');
const ctx = $canvas.getContext('2d');

$canvas.width = cameraConstraints.video.width;
$canvas.height = cameraConstraints.video.height;

$canvas.style.width = $canvas.width;
$canvas.style.height = $canvas.height;

let fps = 10;


socket.on('webcamStreamTreated', data => {
    $canvasImg.src = `data:image/jpeg;base64,${data}`;
});

/**
 * 
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
 * 
 * @param {MediaStream} webcam 
 */
function processImage(webcam) {
    $webcam.srcObject = webcam;
    $webcam.play();

    setInterval(async () => {
        const data = takepicture().slice('data:image/png;base64,'.length+1);
        socket.emit('uploadWebcamStream', { stream: data });
        
    }, 1000 / fps);
}

/**
 * 
 * @returns {String}
 */
function takepicture() {
    ctx.drawImage($webcam, 0, 0, $canvas.width, $canvas.height);
    return $canvas.toDataURL('image/jpeg'); // base64 encoded
}


getMedia(cameraConstraints)
    .then(processImage)
    .catch(e => console.error("Failed to get the webcam media.", e));