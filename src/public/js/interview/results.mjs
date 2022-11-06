import { updateFooterPosition } from '../main.mjs';
import { socket } from '../socket.mjs';
import { msToTime } from '../utils.mjs';

const roomId = window.location.href.split('/').slice(-1);

/*** @type {HTMLElement} */
let $details;
/*** @type {HTMLElement} */
let $legend;
const $hover = document.body.querySelector('#hover');

$hover?.addEventListener('click', removeDetails);


const colors = {
    neutral: '#8C4827',
    happy: '#F2D841',
    sad: '#6D74F2',
    angry: '#E84643',
    fearful: '#9343E8',
    disgusted: '#98DB73',
    surprised: '#828279'
};

const emotions = Object.keys(colors);
const emotionCount = emotions.length;

const primaryColorSRGB = '70, 99, 204';
const grayColorSRGB = '169, 169, 169';

const spiderSize = 500; // px
const spiderMax = 1.;
const spiderInterval = 0.2;

const fontSize = 17;
const fontFamily = 'Arial';
const textDim = {};

const dummy = createCanvas(spiderSize, spiderSize);
dummy.ctx.font = `${fontSize}px ${fontFamily}`;

Object.keys(colors).forEach(e => {
    textDim[e] = dummy.ctx.measureText(e).width;
});


/** @type {{[id: string]: {spider: ImageData, timeline: ImageData}}} */
const participantCanvas = {};







const arcTo = (ctx, p1, p2, p3) => {
    const diffX = p1.x - p2.x,
        diffY = p1.y - p2.y,
        radius = Math.abs(Math.sqrt(diffX*diffX + diffY*diffY)),
        startAngle = Math.atan2(diffY, diffX),
        endAngle   = Math.atan2(p3.y - p2.y, p3.x - p2.x);

    // arc
    ctx.arc(p2.x, p2.y, radius, startAngle, endAngle, false);
};

const pointInCircle = (i, n, r, o=0) => ({
    x: o + Math.cos(2*Math.PI * i / n) * r,
    y: o + Math.sin(2*Math.PI * i / n) * r
});


/**
 * 
 * @param {number} width 
 * @param {number} height 
 * @returns
 */
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    return { canvas, ctx };
}



/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} emotions 
 * @param {boolean} color
 */
function renderEmotionWeb(ctx, emo, color=false) {
    const center = spiderSize / 2;

    ctx.fillStyle = '#888';

    const circleRadius = center / 1.5;
    const points = [];

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = `rgb(${grayColorSRGB}, .3)`;
    ctx.setLineDash([1, 0]);
    ctx.lineWidth = 1;
    ctx.fillStyle = `#444`;
    ctx.font = `${fontSize}px ${fontFamily}`;

    for(let i=0; i < emotionCount; i++) {
        const { x: cx, y: cy } = pointInCircle(i, emotionCount, circleRadius);

        const x = center + cx,
            y = center + cy;

        points.push({ x, y });

        if(!color) {
            ctx.textAlign = (x < spiderSize / 3)? 'right' : (x > 3/4 * spiderSize)? 'left' : 'center';

            // label
            ctx.fillText(emotions[i], center + cx * 1.1, center + cy * 1.1);
        }

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.strokeStyle = `rgb(${grayColorSRGB})`;
    ctx.setLineDash(color? [10, 20] : [4, 10]);

    for(let i=spiderInterval; i <= spiderMax; i += spiderInterval) {
        ctx.beginPath();
        ctx.arc(center, center, i * circleRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
    }


    //
    const emoPoints = [];
    const emoMap = {};

    for(const e of emotions) {
        emoMap[e] = 0;
    }

    for(const t in emo) {
        const l = Object.keys(emo[t]).length;

        // remove empty declarations which should thus break the computed mean
        if(l === 0) {
            delete emo[t];
            continue;
        }

        for(const e in emo[t]) {
            emoMap[e] += emo[t][e];
        }
    }

    for(const e in emoMap) {
        emoMap[e] = Math.floor(emoMap[e] / Object.keys(emo).length * 100) / 100;
        
        const i = emotions.indexOf(e);
        const { x, y } = pointInCircle(i, emotionCount, circleRadius * emoMap[e], center);

        if(color) {
            const { x: xx, y: yy } = pointInCircle((i+1)%emotionCount, emotionCount, circleRadius * emoMap[e], center);

            emoPoints.push({ x, y, xx, yy });
        }
        else {
            emoPoints.push({ x, y });
        }
    }



    if(color) {
        for(let i=0; i < emoPoints.length; i++) {
            const { x, y, xx, yy } = emoPoints[i];

            ctx.fillStyle = `${colors[emotions[i]]}`;
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.lineTo(x, y);
            // ctx.lineTo(xx, yy);
            arcTo(ctx, { x, y }, { x: center, y: center }, { x: xx, y: yy });
            ctx.lineTo(center, center);
            ctx.closePath();
            ctx.fill();
        }
    }
    else {
        ctx.strokeStyle = `rgb(${primaryColorSRGB})`;
        ctx.fillStyle = `rgba(${primaryColorSRGB}, .2)`;
        ctx.lineWidth = 3;
        ctx.setLineDash([1, 0]);

        if(emoPoints.length > 0) {
            ctx.beginPath();

            ctx.moveTo(emoPoints[0].x, emoPoints[0].y);

            for(let i=1; i < emoPoints.length; i++) {
                ctx.lineTo(emoPoints[i].x, emoPoints[i].y);
            }

            ctx.lineTo(emoPoints[0].x, emoPoints[0].y);
            
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} data 
 * @param {number} data.start
 * @param {number} data.end
 * @param {Object} data.answers
 * @param {Object} data.emotions
 */
function renderTimeline(ctx, data) {
    const top = 50;
    const left = 50;
    const bottom = ctx.canvas.height - 100;
    const right = ctx.canvas.width - 150;
    const width = right - left;
    const height = bottom - top;

    // landmarks
    ctx.strokeStyle = `rgb(${grayColorSRGB})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    // landmark legend
    ctx.fillStyle = `rgb(${grayColorSRGB})`;
    ctx.font = `10px ${fontFamily}`;

    ctx.fillText('0', left - 15, bottom + 15);
    ctx.fillText('1', left - 15, top + 10);
    ctx.fillText('1', left - 15, top + 10);

    ctx.textAlign = 'center';
    ctx.fillText('intensity', left, top - 15);
    ctx.textAlign = 'left';
    ctx.fillText('time', right + 10, bottom + 4);

    const startTime = data.start;
    const endTime = data.end;
    const duration = endTime - startTime;

    ctx.textAlign = 'center';
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = `rgba(${grayColorSRGB}, .3)`;
    ctx.lineWidth = 1;

    let t = 0;

    data.answers.forEach(ans => {
        t += ans.timeElapsed;

        const x = t / duration * width;
        const time = msToTime(t);

        const i = (ans.index < data.answers.length-1) ? 'Q'+(ans.index+2) : 'end';

        ctx.fillText(time, x, bottom + 20);
        ctx.fillText(`${i}`, x, top - 15);

        ctx.beginPath();
        ctx.moveTo(x, bottom);
        ctx.lineTo(x, top);
        ctx.stroke();
    });

    const emoMap = {};

    for(const emotion of emotions) {
        emoMap[emotion] = [];
    }


    for(const time in data.emotions) {
        const t = parseInt(time) - startTime;
        const x = left + t / duration * width;

        for(const emotion of emotions) {
            const y = bottom - 2 - (
                (emotion in data.emotions[time])
                    ? data.emotions[time][emotion] * height
                    : 0
            );

            emoMap[emotion].push({ x, y });
        }
    }

    ctx.lineWidth = 1;
    ctx.setLineDash([1, 0]);

    for(const emotion of emotions) {
        const l = emoMap[emotion].length;

        if(l > 0) {
            ctx.strokeStyle = colors[emotion];
            ctx.beginPath();

            ctx.moveTo(emoMap[emotion][0].x, emoMap[emotion][0].y);
            
            for(let i=1; i < l; i++) {
                ctx.lineTo(emoMap[emotion][i].x, emoMap[emotion][i].y);
            }

            ctx.stroke();
        }
    }

}






/**
 * 
 * @param {HTMLElement} $box 
 * @param {string} id 
 */
function fullScreenBox($box, id) {
    $hover?.classList.remove('hidden');
    $details = $box.cloneNode(true);

    $details.classList.add('details-box', 'full');

    document.body.querySelector('#results-list')?.appendChild($details);

    /*** @type {HTMLCanvasElement} */
    const cvsSpider = $details.querySelector('.spider-diagram');
    /*** @type {HTMLCanvasElement} */
    const cvsTimeline = $details.querySelector('.timeline-diagram');

    /** @type {CanvasRenderingContext2D} */
    const ctxSpider = cvsSpider.getContext('2d');
    /** @type {CanvasRenderingContext2D} */
    const ctxTimeline = cvsTimeline.getContext('2d');

    $details.appendChild($legend);

    ctxSpider.putImageData(participantCanvas[id].spider, 0, 0);
    ctxTimeline.putImageData(participantCanvas[id].timeline, 0, 0);
}




function removeDetails() {
    $hover?.classList.add('hidden');
    $details?.remove();
    $details = undefined;
}






/**
 * 
 * @param {Object} data 
 * @param {number} data.date
 * @param {string} data.id
 * @param {string} data.job
 * @param {Object} data.participants
 * @returns 
 */
function fillInterviewList(data) {
    if(!data) {
        return;
    }

    const $h1 = document.body.querySelector('h1');

    if($h1)
        $h1.innerText = data.job;
    
    const $endDate = document.body.querySelector('#interview-end-date');

    if($endDate)
        $endDate.innerText = `End of interview : ${new Date(data.date).toLocaleDateString()}`;

    $legend = document.createElement('section');
    $legend.classList.add('legend');

    $legend.innerHTML = '';

    const $ul = document.createElement('ul');

    for(const emotion in colors) {
        const $li = document.createElement('li');
        const $color = document.createElement('span');
        const $sp = document.createElement('span');

        $color.classList.add('color-square');
        $sp.classList.add('color-name');

        $li.append($color, $sp);

        $sp.innerText = emotion;
        $color.style.setProperty('--color', colors[emotion]);

        $ul.appendChild($li);
    }

    $legend.appendChild($ul);

    const $list = document.body.querySelector('#results-list');

    if(!$list) {
        return;
    }

    $list.innerHTML = '';

    for(const appId in data.participants) {
        const r = data.participants[appId];

        const $box = document.createElement('article');
        $box.classList.add('participant-diag');

        const $id = document.createElement('h6');
        $id.classList.add('applicant-id');
        $id.innerText = '#' + appId;

        $box.appendChild($id);

        const spider = createCanvas(spiderSize, spiderSize);
        renderEmotionWeb(spider.ctx, r.emotions);
        spider.canvas.classList.add('spider-diagram');

        const spiderColor = createCanvas(spiderSize, spiderSize);
        renderEmotionWeb(spiderColor.ctx, r.emotions, true);

        
        const timeline = createCanvas(1000, 500);
        renderTimeline(timeline.ctx, r);
        timeline.canvas.classList.add('timeline-diagram');

        participantCanvas[appId] = {
            spider: spiderColor.ctx.getImageData(0, 0, spiderColor.canvas.width, spiderColor.canvas.height),
            timeline: timeline.ctx.getImageData(0, 0, timeline.canvas.width, timeline.canvas.height)
        };

        $box.append(spider.canvas, timeline.canvas);

        $box.addEventListener('click', () => fullScreenBox($box, appId));

        $list.appendChild($box);
    }









    updateFooterPosition();
}








socket.emit('interviewResultReq', roomId);

socket.on('interviewResultRes', fillInterviewList);