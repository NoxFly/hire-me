import { socket } from './socket.mjs';

socket.on('memberQuit', (data) => {
	const $roomLobby = document.querySelector('#room-not-started');
	const $room = document.querySelector('#room');
	
	if(data.role === 'recruiter') {

		if($room) {
			$room.innerHTML = '<p>The recruiter has left.</p>';
		}

		if($roomLobby) {
			$roomLobby.innerHTML = '<p>The recruiter has left.</p>';
		}
	}
	else {
		if($room) {
			$room.innerHTML = '<p>The applicant has left.</p>';
		}

		if($roomLobby) {
			$roomLobby.innerHTML = '<p>The recruiter has left.</p>';
		}
	}

	socket.off('memberQuit');
});