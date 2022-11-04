import { Router } from 'express';
import { applications, Job, jobs } from '~/server/socket/database';
import { loadTemplate } from './router';
import { Member } from '~/server/socket/Member';
import { getDirectories, getFiles } from '~/server/utils';
import { Room } from '~/server/interview/Room';
import { existsSync } from 'fs';

const router = Router({ caseSensitive: true });




// requested URL in the browser => the .ejs file location from the defined views path
router.get('/history', async (req, res) => {
    const member: Member = req.body.member;

    if(member.role === 'recruiter') {
        const memberHist = [];

        const dirpath = process.env.BASEPATH + '/data/interviews/' + member.token;

        try {
            if(existsSync(dirpath)) {
                const files = await getFiles(dirpath);
            
                for(const file of files) {
                    const filepath = process.env.BASEPATH + '/data/interviews/' + member.token + '/' + file;

                    const data = await Room.loadFromFile(filepath);

                    memberHist.push({
                        id: data.id,
                        name: data.job,
                        date: data.date,
                        participantCount: Object.keys(data.participants).length
                    });
                }
            }
        }
        catch(e) {
            console.error('Failed to retrieve history :', e);
        }

        return loadTemplate(req, res, 'interview/history', {
            history: memberHist.sort((a, b) => a.date < b.date ? -1 : 1)
        });
    }

    res.redirect('/');
});

router.get('/history/:id', async (req, res, next) => {
    const member: Member = req.body.member;

    if(member.role === 'recruiter') {
        const filepath = process.env.BASEPATH + '/data/interviews/' + member.token + '/' + req.params.id;

        try {
            if(existsSync(filepath)) {
                const data = await Room.loadFromFile(filepath);
                return loadTemplate(req, res, 'interview/results', { data });
            }

            throw new Error();
        }
        catch(e) {
            console.error('Failed to load history for ' + filepath + ' :', e);
            return next();
        }
    }

    res.redirect('/');
});

router.get('/create', async (req, res) => {
    const member: Member = req.body.member;

    if(member.role === 'recruiter') {
        const jbs = jobs
            .filter((val: Job) => val.recruiter === member.token)
            .array()
            .map((job: Job) => ({
                ...job,
                done: applications.filter((a: any) => a.includes(job.id)).size
            }));

        return loadTemplate(req, res, 'interview/create', {
            jobs: jbs
        });
    }

    // forbidden for applicants
    res.redirect('/');
});

router.post('/create', async (req, res) => {
    let status = 400;
    
    const member: Member = req.body.member;

    const jobName = req.body.jobName?.trim();

    if(jobName && /^[a-zA-Z\s\-]{3,}$/.test(jobName) && member.role === 'recruiter') {
        try {
            status = 200;
            await member.createRoom(jobName);
        }
        catch(e) {

        }
    }

    res.status(status).redirect('/interview/create');
});

router.get('/lobbies', (req, res) => {
    const member: Member = req.body.member;
    
    const myApply: string[] = applications.get(member.token) || [];

	const lobs = jobs.array()
		.filter((r: Job) => !r.ended && !myApply.includes(r.id));

	loadTemplate(req, res, 'interview/lobby', { jobs: lobs });
});

router.get('/room/:id', (req, res, next) => {
	const room: Job = jobs.get(req.params.id);
	const member: Member = req.body.member;

    if(!room || room.ended || room.recruiter === member.token) {
        return next();
    }

    // applicant not already in : join it
	if(!room?.applicants.includes(member.token)) {
        member.joinRoom(room.id);
	}

    // already done : do not do again
    if(applications.get(member.token)?.includes(room.id)) {
        loadTemplate(req, res, 'interview/room', { alreadyDone: true });
    }

	loadTemplate(req, res, 'interview/room', { room });
});

export { router as default };