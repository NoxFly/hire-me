const $footer = document.getElementById('main-footer');
const $header = document.getElementById('main-header');
const $main = document.querySelector('main');

if($footer && $header && $main) {
    if($main.clientHeight + $header.clientHeight <= window.innerHeight) {
        $footer.classList.add('absolute-footer');
    }
}