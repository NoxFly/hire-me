import * as fs from 'fs';
import * as path from 'path';

const baseDir = '/dev/out';

export function saveFile(fileName: string, buf: Buffer) {
	const filepath = process.env.BASEPATH + baseDir;

	if (!fs.existsSync(filepath)) {
		fs.mkdirSync(filepath);
	}

	fs.writeFileSync(path.resolve(filepath, fileName), buf);
}