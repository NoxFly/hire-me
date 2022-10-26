import { random } from "./utils.mjs";

// animated typing on home page

const $title = document.getElementById('app-slogan');

function keyBoardWriteAnim($el, text, speedMin=70, speedMax=20) {
    let isLastCharSpace = false;

    const loop = (idx) => {
        if(idx < text.length-1) {
            setTimeout(() => loop(++idx), random(speedMax, speedMin));
        }

        if(text[idx] === ' ')
            isLastCharSpace = true;
        else if(isLastCharSpace) {
            isLastCharSpace = false;
            $el.innerText += ' ' + text[idx];
        }
        else
            $el.innerText += text[idx];
    };

    if(text.length > 0) {
        loop(0);
    }
}


if($title) {
    const text = $title.innerText;
    const titleHeight = $title.getBoundingClientRect().height;

    $title.style.height = titleHeight + 'px';
    $title.innerText = '';

    keyBoardWriteAnim($title, text);
}