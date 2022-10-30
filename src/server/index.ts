import dotenv from 'dotenv';
import server from './server';
import * as socket from './socket/socket-manager';

dotenv.config();

process.env.SERVER_HOST = 'http://localhost';


async function run() {
	await server.load();
	await socket.load();
	await server.start();
}

run();