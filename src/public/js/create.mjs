import { socket } from './socket.mjs';

const $url = document.querySelector('#lobby-url span');
const $copyBtn = document.querySelector('#lobby-url button');
const $msg = document.querySelector('#lobby-message');
const $launchBtn = document.querySelector('#launch-interview');



socket.on('memberJoin', () => {
	updateState(true);
});

socket.on('memberQuit', () => {
	updateState(false);
});


let state = false;
let canLaunch = true;

if($url && $copyBtn) {
	$copyBtn.addEventListener('click', () => {
		navigator.clipboard.writeText($url.innerText);
		$copyBtn.classList.add('copied');
		$copyBtn.innerText = 'copied !';

		setTimeout(() => {
			$copyBtn.classList.remove('copied');
			$copyBtn.innerText = 'copy';
		}, 5000);
	});
}

if($launchBtn) {
	$launchBtn.addEventListener('click', () => {
		if(canLaunch) {
			canLaunch = false;
			socket.emit('launchInterview');
		}
	});
}

updateState();

/**
 * 
 * @param {boolean} s 
 */
function updateState(s = null) {
	state = s === null ? $msg?.dataset.state === 'true' : s;

	if($msg) {
		$msg.dataset.state = state;
		$msg.innerText = state? $msg.dataset.success : $msg.dataset.fail;
	}

	if($launchBtn) {
		state
			? $launchBtn.removeAttribute('disabled')
			: $launchBtn.setAttribute('disabled', '');
	}
}