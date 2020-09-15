/**
 * Waits for `time` milliseconds
 *
 * @param {number} time - The amount of
 * 	milliseconds to wait
 *
 * @returns {Promise<void>} A promise that
 * 	resolves when the time has passed
 */
export function wait(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
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
export function classNames(...args) {
    var classes = [];
    for (const arg of args) {
        if (!arg && typeof arg !== 'number')
            continue;
        if (typeof arg === 'string' || typeof arg === 'number') {
            classes.push(arg);
        }
        else if (Array.isArray(arg) && arg.length) {
            var inner = classNames.apply(null, arg);
            if (inner) {
                classes.push(inner);
            }
        }
        else if (typeof arg === 'object') {
            const objArg = arg;
            for (var key in objArg) {
                if (objArg[key]) {
                    classes.push(key);
                }
            }
        }
    }
    return classes.join(' ');
}
/**
 * The type of a webcomponent error. Contains
 * the relevant component as a property
 */
export class WCLibError extends Error {
    /**
     * @param {any} component - The component on which
     * 	the error occurred.
     * @param {string} message - The actual message
     */
    constructor(component, message) {
        super(`${message} (see error.component)`);
        this.component = component;
    }
}
//# sourceMappingURL=shared.js.map