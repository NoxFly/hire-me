import { NextFunction, Request, Response, Router } from 'express';
import { members, tokenKey } from '~/server/socket/socket-manager';
import interviewRouting from './interview.routing';

export const router = Router({ caseSensitive: true });


export function loadTemplate(req: Request, res: Response, page: string, data: { [key: string]: any } = {}) {
	data.page = page;
	data = Object.assign(data, req.params);

	res.render('template', data);
}


router.use((req: Request, res: Response, next: NextFunction) => {
	if(req.url.startsWith('/socket.io/'))
		return;

	const cookie = req.cookies;
	const member = members.get(cookie[tokenKey]);

	if(member) {
		req.body.member = member;
		member.setUrl(req.url);
	}

	next();
});

// requested URL in the browser => the .ejs file location from the defined views path
router.get('/', (req, res) => loadTemplate(req, res, 'general/home'));
router.get('/about', (req, res) => loadTemplate(req, res, 'general/about'));
router.get('/contact', (req, res) => loadTemplate(req, res, 'general/contact'));


router.use('/interview', interviewRouting);


// DEV
// pages that exist only for development
router.get('/stylesheet', (req, res) => loadTemplate(req, res, 'dev/stylesheet'));
router.get('/video', (req, res) => loadTemplate(req, res, 'dev/video'));

router.get('*', (req, res) => loadTemplate(req, res, 'errors/404'));