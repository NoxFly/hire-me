import { Request, Response, Router } from "express";

export const router = Router({ caseSensitive: true });


export function loadTemplate(req: Request, res: Response, page: String, data: {[key: string]: any } = {}) {
    data.page = page;
    data = Object.assign(data, req.params);

    res.render('template', data);
};


router.get('/', (req, res) => loadTemplate(req, res, 'home'));
router.get('/stylesheet', (req, res) => loadTemplate(req, res, 'stylesheet'));
router.get('/video', (req, res) => loadTemplate(req, res, 'video'));