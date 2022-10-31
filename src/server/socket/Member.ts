import { Socket } from 'socket.io';
import { connections, lobbies } from './database';
import { generateToken } from '~/server/utils';
import { io } from './socket-manager';

type MemberRole = 'recruiter' | 'applicant' | 'none';

interface Lobby {
	id: string,
	createdAt: number,
	started: boolean,
	recruiter: string,
	applicant: string
}

export class Member {
	private _role: MemberRole = 'none';
	private lobbyId: string | undefined;
	private inRoom = false;
	private connState = true;
	private url: string;

	constructor(private sock: Socket, private readonly _token: string) {
		this.updateInDb(this.token);

		const lobby: Lobby[] = lobbies
			.array()
			.filter(p => p.recruiter === this.token || p.applicant === this.token)
			.sort((a, b) => a.createdAt <= b.createdAt ? 1 : -1);

		// delete possible multiple lobbies as recruiter, from the oldest to newest, keeping the newer
		for(let i=1; i < lobby.length; i++) {
			if(lobby[i].recruiter === this.token) {
				lobbies.delete(lobby[i].id);
			}
		}

		// re-assigne the newer if it exists
		if(lobby.length > 0) {
			this.lobbyId = lobby[0].id;
			this.role = (lobby[0].recruiter === this.token)? 'recruiter' : 'applicant';
			this.inRoom = lobby[0].started;
		}
	}

	get socket(): typeof this.sock {
		return this.sock;
	}

	get token(): typeof this._token {
		return this._token;
	}

	setUrl(url: typeof this.url) {
		this.url = url;

		// force the role in case he refreshed or changed the page
		if(this.lobbyId && !/^\/interview\/(create|room)(\/\w+)?/.test(this.url)) {
			if(lobbies.get(this.lobbyId)?.recruiter === this.token) {
				this.role = 'recruiter';
				this.quitLobby();
			}
			else if(lobbies.get(this.lobbyId)?.applicant === this.token) {
				this.role = 'applicant';
				this.quitLobby();
			}
		}
	}

	async setSocket(sock: typeof this.sock, token: string): Promise<void> {
		this.sock = sock;
		this.connState = true;
		this.updateInDb(token);
		this.initSocketListener();

		if(this.lobbyId) {
			if(!this.socket.rooms.has(this.lobbyId)) {
				await this.socket.join(this.lobbyId);
			}
		}
	}

	get role() {
		return this._role;
	}

	set role(r: typeof this._role) {
		this._role = r;
	}

	private updateInDb(token: string): void {
		connections.set(token, this.socket.id, 'id');
	}

	private initSocketListener(): typeof this {
		this.socket.on('disconnecting', () => {
			this.connState = false;

			setTimeout(() => {
				if(this.connState)
					return;

				this.quitLobby();
			}, 2000);
		});

		this.socket.on('searchRoom', (roomUrl: string) => {
			const id = roomUrl.slice(roomUrl.lastIndexOf('/')+1);
			this.socket.emit('searchRoomResult', lobbies.has(id));
		});

		this.socket.on('launchInterview', () => {
			this.inRoom = true;
			lobbies.set(this.lobbyId as string, true, 'started');
			io.in(this.lobbyId as string).emit('interviewStart', this.getLobbyUrl());
		});

		return this;
	}

	getLobby(): Lobby | undefined {
		if(this.lobbyId) {
			return lobbies.get(this.lobbyId);
		}

		return undefined;
	}

	getLobbyUrl() {
		return `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/interview/room/${this.lobbyId}`;
	}

	isInRoom(): typeof this.inRoom {
		return this.inRoom;
	}

	async createLobby(): Promise<void> {
		if(!this.lobbyId) {
			this.role = 'recruiter';

			const token = generateToken();

			this.lobbyId = token;

			try {
				lobbies.set(this.lobbyId, {
					id: this.lobbyId,
					createdAt: Date.now(),
					started: false,
					[this.role]: this.token
				});

				await this.socket.join(this.lobbyId);
				this.socket.data.interview = this.lobbyId;
			}
			catch(e) {
				console.error('Failed to join a room as recruiter : ', e);
			}
		}
	}

	async joinLobby(id: string): Promise<void> {
		if(this.lobbyId) {
			this.quitLobby();
		}

		this.role = 'applicant';
		this.lobbyId = id;
		this.inRoom = true;

		try {
			lobbies.set(this.lobbyId, this.token, this.role);

			await this.socket.join('room');
			this.socket.to(this.lobbyId).emit('memberJoin', this.token);
			this.socket.data.interview = this.lobbyId;
		}
		catch(e) {
			console.error('Failed to join a room as participant : ', e);
		}
	}

	quitLobby(): void {
		if(this.lobbyId && this.role !== 'none') {
			try {
				// ensure it still exists
				// for example, in case the recruiter left first
				// then the lobby is destroyed : if the applicant then left
				// it cannot delete what is already deleted.
				if(lobbies.has(this.lobbyId)) {
					lobbies.delete(this.lobbyId, (this.role === 'recruiter')? undefined : this.role);
				}

				this.socket.to(this.lobbyId).emit('memberQuit', { role: this.role });

				this.role = 'none';
				this.lobbyId = undefined;
				this.inRoom = false;
				this.socket.data.interview = undefined;
			}
			catch(e) {
				console.error('Failed to quit a room : ', e);
			}
		}
	}
}