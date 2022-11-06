import { socket } from '../socket.mjs';
import * as timer from './roomTimer.mjs';

let fps = 1;
let running = false;
let questionIndex = -1;
let totalQuestionCount = 1;
let qStartTime = 0;

const TIME_PER_QUESTION = 30 * 1000;

const cameraConstraints = {
    audio: false,
    video: {
        width: 1280,
        height: 720,
        facingMode: 'user'
    }
};


const $webcam = document.createElement('video');
$webcam.id = 'user-camera';

const $canvas = document.createElement('canvas');
const ctx = $canvas.getContext('2d');

$canvas.width = cameraConstraints.video.width;
$canvas.height = cameraConstraints.video.height;


const $quizz = document.body.querySelector('#quizz-container');
const $question = document.body.querySelector('#question');
const $count = document.body.querySelector('#question-count');
const $answers = document.body.querySelector('#answer-pool');
const $confirm = document.body.querySelector('#confirm-container button');




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
    }
    catch(err) {
        throw new Error(err);
    }
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

/**
 * 
 */
async function sendCamera() {
    const buffer = takepicture();
    socket.emit('liveStreamBuffer', { time: Date.now(), stream: buffer });

    setTimeout(() => running && sendCamera(), 1000 / fps);
}

function askForNextQuestion() {
    if(questionIndex < totalQuestionCount) {
        socket.emit('getRoomQuestion', ++questionIndex);
    }
}


async function run() {
    timer.setCountDown(TIME_PER_QUESTION);

    try {
        const camera = await getMedia(cameraConstraints);

        if(camera) {
            $webcam.srcObject = camera;
            $webcam.play();

            document.body.querySelector('main')?.appendChild($webcam);

            sendCamera();
            askForNextQuestion();

        }
    }
    catch(e) {
        console.error('Something went wrong.', e);
    }
}


function submitQuestion(giveUp=false) {
    // do not capture head between 2 questions
    running = false;

    if(!$answers) {
        return;
    }

    const answers = [];
    $answers.querySelectorAll('input:checked').forEach(i => answers.push(i.value));

    if(!giveUp && answers.length === 0) {
        return;
    }

    socket.emit('submitQuizz', {
        index: questionIndex,
        answers,
        from: qStartTime,
        time: Date.now(),
        timeElapsed: timer.timeElapsed
    });

    // next question
    if(questionIndex < totalQuestionCount - 1) {
        askForNextQuestion();
    }
    // end of quizz
    else if($quizz) {
        $webcam.remove();
        $quizz.innerHTML = '<p id="results-message">Thanks for submitting your interview.<br>It has been sent to the recruiter.</p>';
    }
}



socket.on('quizzQuestionForm', form => {
    questionIndex = form.index;
    totalQuestionCount = form.count;
    running = form.index < form.count;
    qStartTime = Date.now();

    if(form.index === 0) {
        socket.emit('quizzStartTime', qStartTime);
    }
    
    if($question) {
        $question.innerText = form.question;
    }

    if($count) {
        const $first = $count.querySelector('span:first-of-type');
        const $second = $count.querySelector('span:last-of-type');

        if($first) {
            $first.innerText = form.index + 1;
        }

        if($second) {
            $second.innerText = form.count;
        }
    }

    if($answers) {
        $answers.innerHTML = '';

        for(const ans of form.answers) {
            const $label = document.createElement('label');
            const $ipt = document.createElement('input');

            if(form.answerType === 'single') {
                $ipt.type = 'radio';
                $ipt.name = 'answer';
                $ipt.value = ans;
            }
            else {
                $ipt.type = 'checkbox';
                $ipt.name = ans;
                $ipt.value = ans;
            }

            $label.innerText = ans;
            $label.prepend($ipt);

            $answers.appendChild($label);
        }
    }

    timer.restart();
    timer.start();
});


$confirm?.addEventListener('click', () => submitQuestion(false));

addEventListener('timeend', () => submitQuestion(true));







document.querySelector('footer')?.classList.add('hidden');



run();