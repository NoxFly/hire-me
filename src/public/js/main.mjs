import { socket } from './socket.mjs';

// adapt the footer depending to the page height



const $footer = document.getElementById('main-footer');
const $header = document.getElementById('main-header');
const $main = document.querySelector('main');

export function updateFooterPosition() {
    if ($footer && $header && $main) {
        const bottom = window.innerHeight - (window.scrollY + $main.getBoundingClientRect().top + $main.offsetHeight);
        const limit = $footer.clientHeight;

        if(bottom > limit) {
            $footer.classList.add('absolute-footer');
        }
        else {
            $footer.classList.remove('absolute-footer');
        }
    }
}

socket.on('interviewStart', href => {
	if(window.location.href !== href) {
		window.location.href = href;
	}
	else {
		window.location.reload();
	}
});

socket.on('roomClosed', id => {
    document.querySelectorAll(`.public-job[data-job-id="${id}"]`).forEach($el => {
        $el.remove();
    });

    document.querySelectorAll('.job-list').forEach($el => {
        if($el.childElementCount === 0) {
            $el.innerHTML = '<p>There is no offers to apply for now.</p>';
        }
    })
});

updateFooterPosition();