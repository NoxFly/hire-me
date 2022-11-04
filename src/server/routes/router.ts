import { NextFunction, Request, Response, Router } from 'express';
import { members, tokenKey } from '~/server/socket/socket-manager';
import { connections, roles } from '~/server/socket/database';
import interviewRouting from './interview.routing';
import { Member } from '~/server/socket/Member';
import { Socket } from 'socket.io';

export const router = Router({ caseSensitive: true });

const registerReg = /^\/register\/?(\?from=.*)?/;


export function loadTemplate(req: Request, res: Response, page: string, data: { [key: string]: any } = {}) {
	data.page = page;
    data.role = req.body.member?.role || 'none';
    
    if(data.role === 'applicant') {
        data.roomUrl = req.body.member?.getRoomUrl();
    }

	data = Object.assign(data, req.params);

	res.render('template', data);
}


router.use((req: Request, res: Response, next: NextFunction) => {
	if(req.url.startsWith('/socket.io/'))
		return;

	const cookie = req.cookies;
    const authToken = cookie[tokenKey];

    let member: Member | undefined;

    if(authToken) {
        member = members.get(authToken);

        if(!member && connections.has(authToken)) {
            const role = roles.get(authToken);
            member = new Member(authToken, role, {} as Socket); // empty socket while io.on('connection')
            members.set(authToken, member);
        }

        if(member) {
            if(registerReg.test(req.url)) {
                return res.redirect('/');
            }

            req.body.member = member;
            member.setUrl(req.url);
        }
        else if(!registerReg.test(req.url)) {
            const page = (req.url === '/register')? '/' : req.url;
            return res.redirect(`/register?from=${page}`);
        }
    }
    else if(!registerReg.test(req.url)) {
        const page = (req.url === '/register')? '/' : req.url;
        return res.redirect(`/register?from=${page}`);
    }

	next();
});

// requested URL in the browser => the .ejs file location from the defined views path
router.get('/', (req, res) => loadTemplate(req, res, 'general/home'));
router.get('/about', (req, res) => loadTemplate(req, res, 'general/about'));
router.get('/contact', (req, res) => loadTemplate(req, res, 'general/contact'));

router.get('/register', (req, res) => loadTemplate(req, res, 'general/profile', { noHeaderFooter: true }));

router.use('/interview', interviewRouting);

router.get('*', (req, res) => loadTemplate(req, res, 'errors/404'));