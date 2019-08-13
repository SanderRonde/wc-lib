var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { wait } from '../shared.js';
/**
 * Functions related to timeouts
 */
export var Timeout;
(function (Timeout) {
    const timeouts = new WeakMap();
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
    function createCancellableTimeout(el, name, callback, waitTime) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!timeouts.has(el)) {
                timeouts.set(el, new Map());
            }
            const elMap = timeouts.get(el);
            if (elMap.has(name)) {
                cancelTimeout(el, name);
            }
            elMap.set(name, setTimeout(callback, waitTime));
            yield wait(waitTime);
            elMap.delete(name);
        });
    }
    Timeout.createCancellableTimeout = createCancellableTimeout;
    /**
     * Cancels the timeout registered to given element with given name
     *
     * @param {any} el - The function on which to register this
     * 	timer. Serves as a way to remember this registration
     * @param {string} name - The name of this timeout
     */
    function cancelTimeout(el, name) {
        if (!timeouts.has(el))
            return;
        const elMap = timeouts.get(el);
        if (!elMap.has(name))
            return;
        clearTimeout(elMap.get(name));
        elMap.delete(name);
    }
    Timeout.cancelTimeout = cancelTimeout;
})(Timeout || (Timeout = {}));
//# sourceMappingURL=timeout.js.map