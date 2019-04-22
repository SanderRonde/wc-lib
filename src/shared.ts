export function wait(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

let _supportsPassive: boolean | null = null;
export function supportsPassive() {
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

export type ClassNamesArg = string|number|{
	[key: string]: any;
}|string[]|{
	[key: string]: any;
}[];
export function classNames(...args: ClassNamesArg[]) {
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