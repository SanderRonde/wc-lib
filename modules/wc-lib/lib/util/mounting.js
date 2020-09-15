var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Waits for the component to have a mounted callback
 * function. It waits for `el.mounted` to be a function
 * instead of undefined.
 *
 * @param {{ mounted: () => void }} el - The element to watch
 */
export function waitForMountedCallback(el) {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        /* istanbul ignore next */
        if (el.mounted) {
            resolve(el.mounted);
        }
        else {
            const interval = window.setInterval(() => {
                if (el.mounted) {
                    window.clearInterval(interval);
                    resolve(el.mounted);
                }
            }, 50);
        }
    }));
}
/**
 * Functions related to listening for mounting of components
 */
export var Mounting;
(function (Mounting) {
    /**
     * Waits for given component to be mounted to the DOM.
     * This can be handy when an element has just been created
     * (for example through `document.createElement`) but it
     * has not yet finished mounting to the dom
     *
     * @param {WebComponent} el - The element to watch
     *
     * @returns {Promise<void>} A promise that resolves when
     * the component has been mounted
     */
    function awaitMounted(el) {
        return __awaiter(this, void 0, void 0, function* () {
            const realEl = el;
            if (realEl.isMounted) {
                return;
            }
            yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const originalMounted = realEl.mounted
                    ? realEl.mounted.bind(realEl)
                    : (yield waitForMountedCallback(realEl)).bind(realEl);
                realEl.mounted = () => {
                    originalMounted && originalMounted();
                    resolve();
                };
            }));
        });
    }
    Mounting.awaitMounted = awaitMounted;
    /**
     * Overrides an element's `.mounted` function and calls
     * the passed function before calling the original function.
     * This can be handy if you need to modify an element before
     * it gets rendered to the DOM but after it has been mounted
     *
     * @param {WebComponentBase} el - The element to watch
     * @param {() => void)} fn - The function to run instead
     *
     * @returns {Promise<void>} A promise that resolves when
     * 	the element has been mounted (and as such your function)
     * 	was ran
     */
    function hookIntoMount(el, fn) {
        return __awaiter(this, void 0, void 0, function* () {
            const realEl = el;
            if (realEl.isMounted) {
                fn();
                return;
            }
            yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const originalMounted = realEl.mounted
                    ? realEl.mounted.bind(realEl)
                    : (yield waitForMountedCallback(realEl)).bind(realEl);
                realEl.mounted = () => {
                    fn();
                    originalMounted && originalMounted();
                    resolve();
                };
            }));
        });
    }
    Mounting.hookIntoMount = hookIntoMount;
})(Mounting || (Mounting = {}));
//# sourceMappingURL=mounting.js.map