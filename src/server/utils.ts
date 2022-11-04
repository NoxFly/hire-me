import crypto from 'crypto';
import { readdir } from 'fs/promises';

export const generateToken = () => crypto.randomBytes(10).toString('hex');

export const parseCookie = (cookie: string) => {
	const obj: { [key: string]: string | number | boolean } = {};

	cookie.split('; ').forEach(c => {
		const i = c.indexOf('=');

		const key = c.slice(0, i);

		let value: string | number | boolean = c.slice(i + 1);

		if (/^\d*\.?\d+$/.test(value)) {
			value = parseInt(value);
		}
		else if (/^true|false$/.test(value)) {
			value = value === 'true';
		}

		obj[key] = value;
	});

	return obj;
};

export const getDirectories = async (src: string) => (await readdir(src, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

export const getFiles = async (src: string) => (await readdir(src, { withFileTypes: true }))
    .filter(f => f.isFile())
    .map(file => file.name)