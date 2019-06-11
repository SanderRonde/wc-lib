import { WebComponentDefiner } from "../wclib.js";
import { WebComponentBase } from "./base.js";

/**
 * Waits for `time` milliseconds
 * 
 * @param {number} time - The amount of
 * 	milliseconds to wait
 * 
 * @returns {Promise<void>} A promise that
 * 	resolves when the time has passed
 */
export function wait(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

// From https://github.com/JedWatson/classnames

/**
 * Arguments for the classNames function
 */
export type ClassNamesArg = string|number|{
	[key: string]: any;
}|string[]|{
	[key: string]: any;
}[];

/**
 * Returns classes depending on passed arguments.
 * If passed a string or number, it's added to the 
 * classes. If passed an array, the array's items
 * are added to the classes. If passed an object,
 * all keys for which the value is true are added
 * to the classes.
 * 
 * @returns {string} The class string
 */
export function classNames(...args: ClassNamesArg[]): string {
	var classes = [];

	for (const arg of args) {
		if (!arg && typeof arg !== 'number') continue;

		if (typeof arg === 'string' || typeof arg === 'number') {
			classes.push(arg);
		} else if (Array.isArray(arg) && arg.length) {
			var inner = classNames.apply(null, arg);
			if (inner) {
				classes.push(inner);
			}
		} else if (typeof arg === 'object') {
			const objArg = arg as {
				[key: string]: any;
			};
			for (var key in objArg) {
				if (objArg[key]) {
					classes.push(key);
				}
			}
		}
	}

	return classes.join(' ');
}

export class WCLibError extends Error {
	constructor(
		public component: (WebComponentDefiner|
			typeof WebComponentDefiner|
			WebComponentBase|
			typeof WebComponentBase), message: string) {
				super(`${message} (see error.component)`);
			}
}