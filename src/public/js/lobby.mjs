import { socket } from './socket.mjs';

const $form = document.querySelector('#lobbies-research-container form');
const $ipt = document.querySelector('#room-url-ipt');
const $btn = document.querySelector('button[type="submit"]');

const urlRegex = /^http:\/\/localhost:\d+\/interview\/room\/[\w]{60}$/;

let value, url;

function iptCb() {
	if($ipt && $btn) {
		value = $ipt.value.trim();

		if(value.length === 0 || !urlRegex.test(value)) {
			$btn.setAttribute('disabled', '');
		}
		else {
			$btn.removeAttribute('disabled');	
		}
	}
}

if($ipt) {
	$ipt.addEventListener('keyup', iptCb);
}

if($form) {
	$form.addEventListener('submit', e => {
		e.preventDefault();

		url = value;

		if($btn) {
			$btn.setAttribute('disabled', '');
		}

		socket.emit('searchRoom', url);
	});
}

socket.on('searchRoomResult', res => {
	if(res === true) {
		window.location.href = url;
	}
	else {
		if($ipt) {
			$ipt.classList.add('fail');
		}

		if($btn) {
			$btn.removeAttribute('disabled');
		}
	}
});

iptCb();