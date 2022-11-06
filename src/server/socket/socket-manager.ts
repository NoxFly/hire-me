import { Socket, Server } from 'socket.io';
import { connections, jobs, Job, MemberRole, roles } from '~/server/socket/database';
import { Member } from '~/server/socket/Member';
import { server } from '~/server/server';
import { generateToken, parseCookie } from '~/server/utils';
import { Room } from '~/server/interview/Room';



let hasLoaded = false;
const cookieMaxAge = 43200; // seconds. Means it's 12h

export const members: Map<string, Member> = new Map();
export const rooms: Map<string, Room> = new Map();
export const tokenKey = 'HM-AuthToken';

// socket.io
export let io: Server;

function userSessionExpired(time: number) {
    return Date.now() - time >= cookieMaxAge * 1000;
}


function removeUnusedConnections() {
	// remove connections that are pasted (limit is the client-side cookie max age)
	connections.sweep((val: any, key: string | number) => {
        const d = userSessionExpired(val.createdAt);

        if(d) {
            roles.delete(key);
        }

        return d;
    });
}

function removeFinishedInterviews() {
    jobs.sweep((val: Job) => val.ended
        || !connections.has(val.recruiter)
        || userSessionExpired(connections.get(val.recruiter).createdAt)
    );
}


function authenticateSocket(socket: Socket) {
	const cookie = parseCookie(socket.handshake.headers.cookie ?? '');
	const authCookie = cookie[tokenKey] as string || '';

	if(authCookie && connections.has(authCookie)) {
		if(members.has(authCookie)) {
            connections.set(authCookie, socket.id, 'id');
            members.get(authCookie)?.setSocket(socket);
        }
		else {
			members.set(authCookie, new Member(authCookie, roles.get(authCookie), socket));
        }
	}
	else {
        // should end interviews that overflowed here
        // ...

        socket.on('register', (type: number) => {
            socket.off('register', () => {});

            const role: MemberRole = (type === 0)? 'recruiter': 'applicant';
            const token = generateToken();

            connections.set(token, { createdAt: Date.now(), id: socket.id });
            roles.set(token, role);
            members.set(token, new Member(token, role, socket));

            socket.emit('authenticate', { tokenKey, token, cookieMaxAge });
        });
	}
}




export function load() {
	if(hasLoaded)
		return;

	hasLoaded = true;

	removeUnusedConnections();
    removeFinishedInterviews();

    // recreate on-stack memory rooms
    jobs.array().forEach((j: Job) => {
        rooms.set(j.id, new Room(j.id));
    });

	io = new Server(server);

	io.on('connection', authenticateSocket);
}