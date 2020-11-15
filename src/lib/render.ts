import { ConfiguredWebcomponent, WebComponentInstance } from './config';
import { GetParams } from './types';
import { getOrCreate } from './util';

export type Template<C extends WebComponentInstance = any> = (
    params: GetParams<C>
) => void;

export class RenderHandler {
    constructor(private _component: ConfiguredWebcomponent) {}

    connected() {
        this.render(true);
    }

    disconnected() {}

    private _shouldRenderGlobal() {
        // TODO: ask modules whether they want to re-render
        return true;
    }

    private get _fixtures() {
        return getOrCreate(() => {
            //Attribute is just for clarity when looking through devtools
            const css = document.createElement('span');
            css.setAttribute('data-type', 'css');

            const html = document.createElement('span');
            html.setAttribute('data-type', 'html');

            this._component.root.appendChild(css);
            this._component.root.appendChild(html);

            return {
                html,
                css,
            };
        });
    }

    private _renderTemplate() {}

    private _render(force?: boolean) {
        // TODO: use static analysis for possible
        // constructed CSS

        this._component.self.css.forEach((css) => {});
    }

    private _rendering: boolean = false;
    private _mounted: boolean = false;
    render(force: boolean) {
        // Check if we're in an infinite loop
        if (this._rendering) {
            throw new Error('Infinite rendering loop detected');
        }
        // Set rendering
        this._rendering = true;

        // Pre-render lifecycle
        if (this._component.preRender() === false && !force) {
            this._rendering = false;
            return;
        }

        // Do actual rendering work
        if (force || this._shouldRenderGlobal()) {
            this._render(force);
        }

        // Signal mounted
        if (!this._mounted) {
            this._component.mounted();
            this._mounted = true;
        }

        // Post render lifecycle
        this._component.postRender();

        // Done rendering
        this._rendering = false;
    }
}
