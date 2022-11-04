import dotenv from 'dotenv';
import { exit } from 'process';
import { loadFaceApi } from './interview/faceDetection';
import server from './server';
import * as socket from './socket/socket-manager';

dotenv.config();

process.env.BASEPATH = __dirname; // equals to ~/src
process.env.SERVER_HOST = 'http://localhost';

async function run() {
    try {
        await server.load();

        socket.load();

        await loadFaceApi();
    }
    catch(e) {
        console.error('Failed to load requierements : ', e);
        exit(1);
    }

	await server.start();
}

run();