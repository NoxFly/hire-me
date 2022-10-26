import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './routes/router';


dotenv.config();


const port = process.env.SERVER_PORT;


// express
export const app = express();


// server
const server = http.createServer(app);


// socket.io
export const io = new socketIo.Server(server);


app.set('port', port);
app.set('case sensitive routing', true);



app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/public', express.static('src/public'));

// views
app.set('views', 'src/public/views');
app.set('view engine', 'ejs');



// routing
app.use('/', router);


function start() {
    server.listen(port, () => {
        console.info('Listening on http://localhost:' + port);
    });
}

function stop() {
    server.close();
}

export default {
    start, stop
};