import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import cv from '@u4/opencv4nodejs';

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);

const port = 3000;

app.set('port', port);
app.set('case sensitive routing', true);

// app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');

app.get('/', (req: express.Request, res: express.Response) => {
    res.render('index.html');
});

const webcam = new cv.VideoCapture(0);

setInterval(() => {
    const frame = webcam.read().flip(1);
    const image = cv.imencode('.jpg', frame).toString('base64');

    io.emit('image', image);
}, 5);

server.listen(3000, () => {
    console.info('Listening on http://localhost:'+port);
});