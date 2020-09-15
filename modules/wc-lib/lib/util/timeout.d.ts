/**
 * Functions related to timeouts
 */
export declare namespace Timeout {
    /**
     * Creates a timer that, when called again, refreshes the
     * timer instead of registering a second one and calling
     * the callback function twice
     *
     * @param {any} el - The function on which to register this
     * 	timer. Serves as a way to remember this registration
     * @param {string} name - The name of this timeout
     * @param {() => void} callback - The function to call
     * 	when the time expires
     * @param {number} waitTime - How long to wait
     *
     * @returns {Promise<void>} A promise that resolves
     * 	when the time expires (this is not cancelled)
     * 	when the timer is refreshed
     */
    function createCancellableTimeout(el: any, name: string, callback: () => void, waitTime: number): Promise<void>;
    /**
     * Cancels the timeout registered to given element with given name
     *
     * @param {any} el - The function on which to register this
     * 	timer. Serves as a way to remember this registration
     * @param {string} name - The name of this timeout
     */
    function cancelTimeout(el: any, name: string): void;
}
//# sourceMappingURL=timeout.d.ts.map