import { Router } from 'express';
import { lobbies } from '~/server/socket/database';
import { loadTemplate } from './router';
import { Member } from '~/server/socket/Member';

const router = Router({ caseSensitive: true });




// requested URL in the browser => the .ejs file location from the defined views path
router.get('/history', (req, res) => loadTemplate(req, res, 'interview/history'));

router.get('/create', async (req, res) => {
	const member: Member = req.body.member;

	if(!member) {
		return res.redirect('/');
	}
	
	if(member.isInRoom()) {
		if(member.role === 'applicant') {
			return loadTemplate(req, res, 'interview/create', {
				lobby: null,
				lobbyUrl: member.getLobbyUrl()
			});
		}
		else if(member.role === 'recruiter') {
			return res.redirect(`/interview/room/${member.getLobby()?.id}`);
		}
	}

	await member.createLobby();
	const lobby = member.getLobby();

	loadTemplate(req, res, 'interview/create', {
		lobby,
		hash: lobby?.id,
		lobbyUrl: member.getLobbyUrl(),
	});
});

router.get('/lobbies', (req, res) => {
	const lobs = Array.from(lobbies.entries())
		.filter((r: any) => !r[1].started)
		.map((r: any) => ({
			...r[1],
			url: `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/interview/room/${r[1].id}`
		}));

	loadTemplate(req, res, 'interview/lobby', { lobbies: lobs });
});

router.get('/room/:id', (req, res) => {
	const lobby = lobbies.get(req.params.id);
	const member: Member = req.body.member;

	if(!member) {
		return res.redirect('/');
	}


	if(
		!lobby || // lobby does not exist or
		(
			lobby.recruiter !== member.token && // the requester is not the recruiter
			lobby.applicant && // and the lobby already has an applicant
			lobby.applicant !== member.token // and this applicant is not the requester
		)
	) {
		return loadTemplate(req, res, 'errors/404');
	}

	const role = member.role;

	if(role === 'none') {
		member.joinLobby(lobby.id);
	}

	loadTemplate(req, res, 'interview/room', { lobby, role });
});

router.get('/results/:id', (req, res) => loadTemplate(req, res, 'interview/results'));


export { router as default };