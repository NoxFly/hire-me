import { updateFooterPosition } from '../main.mjs';
import { socket } from '../socket.mjs';

socket.on('jobCreated', job => {
    const $art = document.createElement('article');
    $art.classList.add('public-job');
    $art.dataset.jobId = job.id;

    const $ovw = document.createElement('div');
    $ovw.classList.add('job-name');

    const $sp1 = document.createElement('span');
    const $sp2 = document.createElement('span');

    $sp1.innerText = job.name;
    $sp2.innerText = '#' + job.id;

    $ovw.append($sp1, $sp2);

    const $nbApp = document.createElement('div');
    $nbApp.classList.add('applicant-count');

    const $sp3 = document.createElement('span');

    $sp3.innerText = '0 applicant';

    $nbApp.appendChild($sp3);

    const $createAt = document.createElement('div');
    $createAt.classList.add('job-creation');

    const $sp4 = document.createElement('span');

    const d = new Date(job.createdAt).toLocaleDateString();

    $sp4.innerText = d;

    $createAt.appendChild($sp4);

    const $action = document.createElement('div');
    $action.classList.add('action');
    
    const $btn = document.createElement('button');
    $btn.innerText = 'apply';

    const $a = document.createElement('a');
    $a.href = `/interview/room/${job.id}`;

    $btn.prepend($a);

    $action.appendChild($btn);

    $art.append($ovw, $nbApp, $createAt, $action);

    const $container = document.body.querySelector('#lobbies-research-container');

    if($container?.children[0]?.tagName === 'P') {
        $container.innerHTML = '';
    }

    $container?.appendChild($art);

    updateFooterPosition();
});

updateFooterPosition();