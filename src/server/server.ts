import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './routes/router';
import multer from 'multer';



export let server: http.Server;

let app: any;


function load() {
	app = express();

	server = http.createServer(app);


	// express config
	app.set('port', process.env.SERVER_PORT);
	app.set('case sensitive routing', true);



	app.use(cors());
	app.use(cookieParser());
	app.use(multer().array('~~/data/upload/'));
	app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

	app.use('/public', express.static('src/public'));
	app.use('/io', express.static('node_modules/socket.io-client/dist'));

	// views
	app.set('views', 'src/public/views');
	app.set('view engine', 'ejs');



	// routing
	app.use('/', router);
}




function start() {
	server.listen(process.env.SERVER_PORT, () => {
		console.info(`Listening on ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
	});
}

function stop() {
	server.close();
}

export default {
	load, start, stop
};