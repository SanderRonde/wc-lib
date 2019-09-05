/**
 * Waits for `time` milliseconds
 *
 * @param {number} time - The amount of
 * 	milliseconds to wait
 *
 * @returns {Promise<void>} A promise that
 * 	resolves when the time has passed
 */
export declare function wait(time: number): Promise<void>;
/**
 * Arguments for the classNames function
 */
export declare type ClassNamesArg = string | number | {
    [key: string]: any;
} | string[] | {
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
export declare function classNames(...args: ClassNamesArg[]): string;
/**
 * The type of a webcomponent error. Contains
 * the relevant component as a property
 */
export declare class WCLibError extends Error {
    component: any;
    /**
     * @param {any} component - The component on which
     * 	the error occurred.
     * @param {string} message - The actual message
     */
    constructor(component: any, message: string);
}
//# sourceMappingURL=shared.d.ts.map