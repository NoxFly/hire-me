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