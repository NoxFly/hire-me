import crypto from 'crypto';

export const generateToken = () => crypto.randomBytes(30).toString('hex');

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