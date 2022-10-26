import { Router } from "express";
import { loadTemplate } from "./router";

const router = Router({ caseSensitive: true });

// requested URL in the browser => the .ejs file location from the defined views path
router.get('/history', (req, res) => loadTemplate(req, res, 'interview/history'));
router.get('/create', (req, res) => loadTemplate(req, res, 'interview/create'));
router.get('/lobby', (req, res) => loadTemplate(req, res, 'interview/lobby'));
router.get('/room/:id', (req, res) => loadTemplate(req, res, 'interview/room'));
router.get('/results/:id', (req, res) => loadTemplate(req, res, 'interview/results'));


export { router as default };