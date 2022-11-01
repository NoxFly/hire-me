import { Socket } from 'socket.io';
import server, { io } from './server';

import { loadFaceApi, processFrame } from './dev/common';

process.env.BASEPATH = __dirname; // equals to ~/src


io.on('connection', (socket: Socket) => {
	console.info('New socket connected [' + socket.id + ']');

	socket.on('uploadWebcamStream', async (data: { stream: string }) => { // base64 img without the common starts
		const currentDominantEmotionObj = await processFrame(data.stream);
		// {
		//   '1667207597822': {
		//     dominantEmotion: 'neutral',
		//     dominantEmotionPerc: 0.8099568486213684
		//   }
		// }
		console.log(currentDominantEmotionObj);
		//save in session
		//@NoxFly

		// socket.emit('webcamStreamTreated', data.stream);
	});
});


(async () => {
	await loadFaceApi();
	server.start();
})();