import dotenv from 'dotenv';
import { loadFaceApi } from './dev/common';
import server from './server';
import * as socket from './socket/socket-manager';

dotenv.config();

process.env.BASEPATH = __dirname; // equals to ~/src
process.env.SERVER_HOST = 'http://localhost';



async function run() {
	await server.load();

	socket.load();

	await loadFaceApi();

	await server.start();
}

run();
