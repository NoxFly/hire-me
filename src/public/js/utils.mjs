/**
 * Generates a random integer between [iMin, iMax].
 * If iMin < iMax, then it swaps both.
 * If no argument is given, then returns a random decimal (shortcut function).
 * If 1 argument is given, then returns a random interger between [0, iMax].
 * @param {Number} iMin The left-bound number. If iMin < iMax, it will be handled (swapped)
 * @param {Number} iMax The right-bound number. If iMin < iMax, it will be handled (swapped)
 * @returns The randomly generated integer between [iMin, iMax]
 */
export const random = (iMin = null, iMax = 0) => iMin === null
	? Math.random()
	: Math.floor(Math.random() * (Math.max(iMin, iMax) - Math.min(iMin, iMax) + 1)) + Math.min(iMin, iMax);

export function msToTime(s) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    // var hrs = (s - mins) / 60;

    mins = ('0' + mins).slice(-2);
    secs = ('0' + secs).slice(-2);

    return mins + ':' + secs;
}