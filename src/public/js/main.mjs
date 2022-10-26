// adapt the footer depending to the page height
const $footer = document.getElementById('main-footer');
const $header = document.getElementById('main-header');
const $main = document.querySelector('main');

if($footer && $header && $main) {
    if($main.clientHeight + $header.clientHeight <= window.innerHeight) {
        $footer.classList.add('absolute-footer');
    }
}

// authenticate the client on page load
socket.on('authenticate', ({ token, tokenKey, cookieMaxAge }) => {
    console.log('token : ', token);
    document.cookie = `${tokenKey}=${token}; max-age=${cookieMaxAge}; sameSite=lax; path=/`;
});