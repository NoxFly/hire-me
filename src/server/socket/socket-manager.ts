import { Socket, Server } from 'socket.io';
import { processFrame } from '~/server/dev/common';
import { connections } from '~/server/socket/database';
import { Member } from '~/server/socket/Member';
import { server } from '~/server/server';
import { generateToken, parseCookie } from '~/server/utils';



let hasLoaded = false;
const cookieMaxAge = 43200; // seconds. Means it's 12h

export const members: Map<string, Member> = new Map();
export const tokenKey = 'HM-AuthToken';

// socket.io
export let io: Server;


function removeUnusedConnections() {
	// remove connections that are pasted (limit is the client-side cookie max age)
	connections.sweep((val: any) => Date.now() - val.createdAt >= cookieMaxAge * 1000);
}


function authenticateSocket(socket: Socket) {
	const cookie = parseCookie(socket.handshake.headers.cookie ?? '');
	const authCookie = cookie[tokenKey] as string || '';

	if (authCookie && connections.has(authCookie)) {
		if(members.has(authCookie))
			members.get(authCookie)?.setSocket(socket, authCookie);
		else
			members.set(authCookie, new Member(socket, authCookie));
	}
	else {
		// cookie expired on server side but wasn't cleared on client side
		if(connections.has(authCookie))
			connections.delete(authCookie);

		const token = generateToken();

		connections.set(token, { createdAt: Date.now() });
		members.set(token, new Member(socket, token));

		socket.emit('authenticate', { tokenKey, token, cookieMaxAge });
	}
}


function initSocketDevListeners(socket: Socket) {
	socket.on('uploadWebcamStream', (data: { stream: string }) => { // base64 img
		const treatedImage = data.stream; // TODO : treat image with tenserflow

		socket.emit('webcamStreamTreated', treatedImage);
	});
}




export function load() {
	if(hasLoaded)
		return;

	hasLoaded = true;

	removeUnusedConnections();

	io = new Server(server);

	io.on('connection', (socket: Socket) => {
		authenticateSocket(socket);
		initSocketDevListeners(socket);


		// dev
		socket.on('uploadWebcamStream', async (data: { stream: string }) => { // base64 img without the common starts
			const currentDominantEmotionObj = await processFrame(data.stream);
			// {
			//   '1667207597822': {
			//     dominantEmotion: 'neutral',
			//     dominantEmotionPerc: 0.8099568486213684
			//   }
			// }
			console.log(currentDominantEmotionObj);
			// save in session
			// @NoxFly
	
			// socket.emit('webcamStreamTreated', data.stream);
		});
	});
}