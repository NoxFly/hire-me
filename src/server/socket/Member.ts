import { Socket } from 'socket.io';
import { jobs, Job, MemberRole, applications, connections } from './database';
import { generateToken } from '~/server/utils';
import { io, rooms } from './socket-manager';
import { processFrame } from '~/server/interview/faceDetection';
import { dummyQuestions, QuizzAnswer, Room } from '~/server/interview/Room';


/**
 * A member can have 1 role between 'Applicant' and 'Recruiter'.
 * A Recruiter can makes a much as interviews he wants.
 * An applicant can only apply to 1 interview at a time.
 * 
 * ==> Member.rooms.length = 0..1 if applicant
 *     Member.rooms.length = 0..* if recruiter
 */
export class Member {
	private room: string = '';
	private connState = true;
	private url: string;

	constructor(
        private readonly _token: string,
        private readonly _role: MemberRole,
        private sock: Socket
    ) {
        const fltFn: (p: Job) => boolean = (this.role === 'recruiter')
            ? p => p.recruiter === this.token
            : p => p.applicants.includes(this.token);

		this.room = jobs
			.array()
			.find(fltFn)?.id || '';
	}

	get socket(): typeof this.sock {
		return this.sock;
	}

	get token(): typeof this._token {
		return this._token;
	}

    get role() {
		return this._role;
	}

	setUrl(url: typeof this.url) {
		this.url = url;
	}

	async setSocket(sock: typeof this.sock): Promise<void> {
        // enable all listeners on new socket
		this.sock = sock;
		this.connState = true;
		this.initSocketListener();

		if(this.isInRoom()) {
            this.enableRoomListeners();
		}
	}

	private initSocketListener(): typeof this {
		this.socket.on('disconnecting', () => {
			this.connState = false;

            // disable all listeners on previous socket
            if(this.role === 'recruiter') {
                this.socket.off('launchInterview', () => {});
            }
            else {
                // this.socket.off('searchRoom', () => {});
                if(this.room.length > 0) {
                    this.disableRoomListeners();
                }
            }

			setTimeout(() => {
				if(this.connState)
					return;

				this.quitRoom();
			}, 2000);
		});

        if(this.role === 'recruiter') {
            this.socket.on('closeRoom', (id: string) => this.endRoom(id));
        }

		return this;
	}

    /**
     * APPLICANT only
     */
	getRoomUrl() {
		return this.room
            ? `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/interview/room/${this.room}`
            : undefined;
	}

	isInRoom(): boolean {
		return !!this.room;
	}

    /**
     * RECRUITER only
     */
	async createRoom(jobName: string): Promise<void> {
        const token = generateToken();

        try {
            const job: Job = {
                id: token,
                createdAt: Date.now(),
                ended: false,
                name: jobName,
                recruiter: this.token,
                applicants: []
            };

            jobs.set(token, job);
            rooms.set(token, new Room(token));
            io.emit('jobCreated', job);
        }
        catch(e) {
            console.error('Failed to create a job : ', e);
        }
	}

    async endRoom(roomId: string): Promise<void> {
        if(jobs.has(roomId) && !jobs.get(roomId).ended) {
            jobs.set(roomId, true, 'ended');

            if(rooms.has(roomId)) {
                try {
                    await rooms.get(roomId)?.save(process.env.BASEPATH + '/data/interviews');
                }
                catch(e) {}
            }

            io.emit('roomClosed', roomId);
        }
    }

    /**
     * APPLICANT only
     * the room MUST exist
     * @param id The room's id
     */
	async joinRoom(id: string): Promise<void> {
		if(id !== this.room) {
            this.quitRoom();
        }

		this.room = id;

        const { applicants, recruiter } = jobs.get(id);

        if(!applicants.includes(this.token)) {
            try {
                jobs.push(id, this.token, 'applicants');
                io.to(connections.get(recruiter)?.id).emit('memberJoin', id, this.token);

                this.enableRoomListeners();
            }
            catch(e) {
                console.error('Failed to join a room as participant : ', e);
                this.room = '';
            }
        }
	}

    /**
     * APPLICANT only
     * Called when an applicant finally does not want to apply to a job,
     * or when he has finished its interview.
     */
	async quitRoom(): Promise<void> {
		if(this.isInRoom()) {
			try {
				// ensure it still exists
				// for example, in case the recruiter left first
				// then the room is destroyed : if the applicant then left
				// it cannot delete what is already deleted.
				if(jobs.has(this.room)) {
                    const { recruiter } = jobs.get(this.room);

                    const done = applications.has(this.token);
                    const event = done? 'applicationDone' : 'memberLeft';

                    if(!done) {
					    jobs.remove(this.room, this.token, 'applicants');
                    }

                    io.to(connections.get(recruiter)?.id).emit(event, this.room, this.token);
				}


				this.room = '';

                if(this.role === 'applicant') {
                    this.disableRoomListeners();
                }
			}
			catch(e) {
				console.error('Failed to quit a room : ', e);
			}
		}
	}

    /**
     * from APPLICANT
     * @param buffer The applicant's stream buffer
     */
    private async receiveLiveStreamBuffer(buffer: string): Promise<void> {
        if(this.isInRoom()) {
            const emotions = await processFrame(buffer);
            rooms.get(this.room)?.applicant(this.token).addEmotionData(Date.now(), emotions);
        }
    }

    private async treatAnswer(data: QuizzAnswer): Promise<void> {
        // collect data
        rooms.get(this.room)?.applicant(this.token).addAnswerData(data);

        // end of quizz
        if(data.index === dummyQuestions.length - 1) {
            applications.ensure(this.token, []);

            if(!!this.room && !applications.get(this.token).includes(this.room)) {
                applications.push(this.token, this.room);
            }

            this.quitRoom();
        }
    }

    private enableRoomListeners(): void {
        this.socket.on('liveStreamBuffer', (buffer: { stream: string }) => this.receiveLiveStreamBuffer(buffer.stream));
        this.socket.on('getRoomQuestion', (qidx: number) => this.socket.emit('quizzQuestionForm', dummyQuestions[qidx]));
        this.socket.on('submitQuizz', (data: QuizzAnswer) => this.treatAnswer(data));
    }

    private disableRoomListeners(): void {
        this.socket.off('liveStreamBuffer', () => {});
        this.socket.on('initQuizz', () => {});
        this.socket.off('submitQuizz', () => {});
    }
}