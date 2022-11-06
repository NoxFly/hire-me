import { socket } from './socket.mjs';

const $articles = document.body.querySelectorAll('form article');
const $btn = document.body.querySelector('form button');

let $selected = null;

$articles.forEach($article => {
    $article.addEventListener('click', () => {
        if(!$article.classList.contains('selected')) {
            $selected = $article;
            document.body.querySelector('form article.selected')?.classList.remove('selected');
            $article.classList.add('selected');
        }
    });
});

$btn?.addEventListener('click', (e) => {
    e.preventDefault();

    if($selected) {
        socket.emit('register', parseInt($selected.dataset.value));
    }
});

// authenticate the client on page load
socket.on('authenticate', ({ token, tokenKey, cookieMaxAge }) => {
	document.cookie = `${tokenKey}=${token}; max-age=${cookieMaxAge}; sameSite=lax; path=/`;
    const from = (window.location.href.split('?')[1] || 'from=/').split('=')[1] || '/';
    window.location.href = from;
});