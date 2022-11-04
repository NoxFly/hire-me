const $timer = document.querySelector('#timer');
const $cvsTimer = document.createElement('canvas');
const timerCtx = $cvsTimer.getContext('2d');

$cvsTimer.width = 250;
$cvsTimer.height = 250;

if($timer) {
    $timer.appendChild($cvsTimer);
}

let shouldPlay = false;
let COUNTDOWN = 0;

export let timeRemaining = 0;
export let timeElapsed = 0;

let percentageElapsed = 0;
let qStartTime = Date.now();

let arc;

function msToTime(s) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    // var hrs = (s - mins) / 60;

    mins = ('0' + mins).slice(-2);
    secs = ('0' + secs).slice(-2);

    return mins + ':' + secs;
}


function moveCircle() {
    const now = Date.now();
    timeElapsed = now - qStartTime;
    timeRemaining = Math.max(0, COUNTDOWN - timeElapsed);
    const te = (qStartTime - now) * -1;
    percentageElapsed = te / COUNTDOWN;

    if(percentageElapsed < 1) {
        arc = Math.PI * 2 - (Math.PI * 2 * percentageElapsed);
    }
}

function drawCircle() {
    let textColor = '#444',
        circleColor = '#5676e9';

    if(percentageElapsed >= 0.75) {
        textColor = circleColor = '#d33';
    }

    timerCtx.save();

    timerCtx.translate($cvsTimer.width / 2, $cvsTimer.height / 2);

    // background
    timerCtx.beginPath();
    timerCtx.arc(0, 0, $cvsTimer.height / 2.21, 0, 2 * Math.PI);
    timerCtx.fillStyle = '#e3e3e3';
    timerCtx.fill();
    timerCtx.closePath();

    // text
    const txt = msToTime(timeRemaining);
    const fontSize = $cvsTimer.width * 15 / 100;

    timerCtx.fillStyle = textColor;
    timerCtx.font = `${fontSize}px Roboto`;
    timerCtx.textAlign = 'center';
    timerCtx.fillText(txt, 0, `${fontSize / 3}`);

    if(percentageElapsed < 1.0) {
        timerCtx.rotate(-90 * Math.PI / 180);

        // circle
        timerCtx.beginPath();
        timerCtx.arc(0, 0, $cvsTimer.height / 2.2, 0, arc, false);
        timerCtx.lineWidth = 3;
        timerCtx.strokeStyle = circleColor;
        timerCtx.stroke();
        timerCtx.closePath();
    }
    
    timerCtx.restore();
}

function render() {
    timerCtx.clearRect(0, 0, $cvsTimer.width, $cvsTimer.height);

    moveCircle();
    drawCircle();
}

function loop() {
    render();

    if(percentageElapsed < 1.0) {
        if(shouldPlay) {
            window.requestAnimationFrame(loop);
        }
    }
    else {
        window.dispatchEvent(new Event('timeend'));
    }
}

export function restart() {
    shouldPlay = false;
    qStartTime = Date.now();
    render();
}

export function start() {
    shouldPlay = true;

    loop();
}

export function pause() {
    shouldPlay = false;
}

export function setCountDown(ms) {
    COUNTDOWN = Math.max(0, ms);
    render();
}