import { socket } from '../socket.mjs';

document.querySelectorAll('.end-btn').forEach($btn => {
    $btn.addEventListener('click', () => {
        const $art = $btn.closest('article.job');
        const id = $art?.dataset.jobId;
        
        socket.emit('closeRoom', id);

        $btn.closest('.action').innerHTML = '<span>Ended</span>';
    });
});


function get$Room(roomId, subElementClass) {
    return document.body.querySelector(`.job[data-job-id="${roomId}"] .${subElementClass}`);
}

function updateParticipants(roomId, vec) {
    const $el = get$Room(roomId, 'applicant-count');

    if($el) {
        const newCount = parseInt($el.innerText.split(' ')[0]) + vec;
        $el.innerText = `${newCount} applicant${newCount>1?'s':''}`;
    }
}

function incRoomParticipation(roomId) {
    const $el = get$Room(roomId, 'applicant-done');

    if($el) {
        $el.innerText = parseInt($el.innerText) + 1;
    }
}

socket.on('memberJoin', (roomId) => updateParticipants(roomId, 1));
socket.on('memberLeft', (roomId) => updateParticipants(roomId, -1));
socket.on('applicationDone', (roomId) => incRoomParticipation(roomId));