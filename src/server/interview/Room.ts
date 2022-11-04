import * as fs from 'fs/promises';
import { inspect } from 'util';
import { jobs } from '~/server/socket/database';
import { EmotionMap, Emotion } from './Emotion';


export type AnswerType = 'single' | 'multiple';

export interface QuizzForm {
    count: number,
    index: number,
    answerType: AnswerType,
    question: string,
    answers: string[]
}

export interface QuizzAnswer {
    index: number,
    answers: string[],
    from: number,
    timeElapsed: number
}

export interface Timeline {
    [timestamp: number]: Partial<EmotionMap>
}

export interface RoomData {
    id: string,
    job: string,
    date: number,
    participants: {
        [key: string]: {
            emotions: Timeline,
            answers: QuizzAnswer[]
        }
    }
}


export class ApplicantRoomData {
    private timeline: Timeline = {};
    private answers: QuizzAnswer[] = [];

    constructor() {}

    getTimeline(): typeof this.timeline {
        return this.timeline;
    }

    getAnswers(): typeof this.answers {
        return this.answers;
    }

    addAnswerData(data: QuizzAnswer): void {
        this.answers.push(data);
    }

    addEmotionData(timestamp: number, data: EmotionMap): void {
        const fdata: Partial<EmotionMap> = {};

        for(const emotion in data) {
            const k = emotion as Emotion;

            if(data[k] > 0) {
                fdata[k] = data[k];
            }
        }

        this.timeline[timestamp] = fdata;
    }
    

    clearData(): void {
        this.timeline = {};
    }
}


export class Room {
    applicants: { [id: string]: ApplicantRoomData } = {};

    constructor(private readonly roomId: string) {}

    static async loadFromFile(src: string): Promise<RoomData> {
        try {
            const content = await fs.readFile(src, { encoding: 'utf8' });
            const data = JSON.parse(content);
            return data;
        }
        catch(e) {
            console.error('Failed to read file ' + src + ' : ', e);
            throw new Error();
        }
    }

    private toJSON(): string {
        const data: RoomData = {
            id: this.roomId,
            job: jobs.get(this.roomId)?.name,
            date: Date.now(),
            participants: {}
        };

        for(const applId in this.applicants) {
            data.participants[applId] = {
                emotions: this.applicants[applId].getTimeline(),
                answers: this.applicants[applId].getAnswers()
            };
        }

        return JSON.stringify(data);
    }

    async save(dirpath: string): Promise<void> {
        try {
            if(!dirpath.endsWith('/')) {
                dirpath += '/';
            }

            dirpath += jobs.get(this.roomId)?.recruiter + '/';

            await fs.mkdir(dirpath, { recursive: true });
            await fs.writeFile(dirpath + this.roomId, this.toJSON());

            return Promise.resolve();
        }
        catch(e) {
            console.error('Failed to save room file with id ' + this.roomId);
            console.error('filepath : ' + dirpath);
            console.error(e);

            return Promise.reject();
        }
    }

    applicant(applicantId: string) {
        if(!(applicantId in this.applicants)) {
            this.applicants[applicantId] = new ApplicantRoomData();
        }

        return this.applicants[applicantId];
    }
}


export const dummyQuestions: QuizzForm[] = [
    {
        count: 3,
        index: 0,
        answerType: 'single',
        question: 'Is this a real question ?',
        answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D', 'Answer E', 'Answer F']
    },
    {
        count: 3,
        index: 1,
        answerType: 'multiple',
        question: 'Which language(s) do you mastery ?',
        answers: ['Java', 'Python', 'C++', 'C', 'C#', 'Javascript', 'PHP', 'Ocaml', 'R', 'Ruby', 'CSS', 'SCSS', 'Brainfuck', 'Swift', 'Bash']
    },
    {
        count: 3,
        index: 2,
        answerType: 'single',
        question: 'Is the Javascript the best language ?',
        answers: ['yes', 'No']
    },
]