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

let _supportsPassive: boolean | null = null;
/**
 * Returns true if this browser supports
 * passive event listeners
 * 
 * @returns {boolean} Whether this browser
 * 	supports passive event listeners
 */
export function supportsPassive(): boolean {
	if (_supportsPassive !== null) {
		return _supportsPassive;
	}
	_supportsPassive = false;
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function () {
				_supportsPassive = true;
			}
		});
		const tempFn = () => { };
		window.addEventListener("testPassive", tempFn, opts);
		window.removeEventListener("testPassive", tempFn, opts);
	}
	catch (e) { }
	return _supportsPassive;
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
		if (!arg) continue;

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