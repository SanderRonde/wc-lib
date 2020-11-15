import { RenderHandler, Template } from './render';

export type WebComponent<T extends HTMLElement = HTMLElement> = {
    new (...args: any[]): T;
};

export type WebComponentInstance<T extends HTMLElement = HTMLElement> = T;

export declare class ConfiguredWebcomponent extends HTMLElement {
    /**
     * The name of this component, needs to contain at
     * least one dash
     */
    static readonly is: string;
    /**
     * A description for this component (used for tooling)
     */
    static readonly description: string;
    /**
     * CSS templates rendered for this component
     */
    static readonly css: Template[];
    /**
     * HTML templates rendered for this component
     */
    static readonly html: Template[];
    /**
     * Dependencies for this component
     */
    static readonly dependencies: WebComponent[];
    /**
     * The static component this instance was created from
     */
    readonly self: typeof ConfiguredWebcomponent;
    /**
     * Render this component
     *
     * @param {boolean} force - Whether to force this render
     * or to leave it up to diffing
     */
    render(force?: boolean): void;
    /**
     * A function called just before the component is rendered.
     * Returning false aborts the render unless force is true
     * in renderToDOM
     */
    preRender(): void | false;
    /**
     * A function called after rendering the component
     */
    postRender(): void;
    /**
     * A function called when the component is mounted to the DOM.
     * When you override this, be sure to call super.connectedCallback
     * or no rendering methods will be registered
     */
    connectedCallback(): void;
    /**
     * A function called when the component is removed from the DOM.
     * When you override this, be sure to call super.disconnectedCallback
     * or no removing methods will be registered
     */
    disconnectedCallback(): void;
    /**
     * A function called when the component has been mounted to the
     * DOM and has been rendered for the first time.
     */
    mounted(): void;
    /**
     * The shadowroot of this component that all of its rendered
     * contents are attached to
     */
    readonly root: ShadowRoot;
}

export interface WebcomponentConfiguration {
    /**
     * The name of this component, needs to contain at
     * least one dash
     */
    is: string;
    /**
     * A description for this component (used for tooling)
     */
    description?: string;
    /**
     * CSS templates rendered for this component
     */
    css?: Template | Template[] | null;
    /**
     * HTML templates rendered for this component
     */
    html?: Template | Template[] | null;
    /**
     * Dependencies for this component. These are automatically
     * discovered during run-time or static analysis but in case
     * they are not, they can be defined here
     */
    dependencies?: WebComponent[];
}

export function config(
    config: WebcomponentConfiguration
): (base: WebComponent) => typeof ConfiguredWebcomponent {
    return (base: WebComponent) =>
        class ConfiguredWebcomponentCls
            extends base
            implements ConfiguredWebcomponent {
            static readonly is: string = config.is;
            static readonly description: string = config.description || '';
            static readonly dependencies: WebComponent[] =
                config.dependencies || [];
            static readonly css: Template[] = config.css
                ? Array.isArray(config.css)
                    ? config.css
                    : [config.css]
                : [];
            static readonly html: Template[] = config.html
                ? Array.isArray(config.html)
                    ? config.html
                    : [config.html]
                : [];

            get self() {
                return ConfiguredWebcomponentCls as any;
            }

            public readonly root = this.attachShadow({
                mode: 'open',
            });

            #renderHandler: RenderHandler = new RenderHandler(this);
            render(force: boolean = false) {
                this.#renderHandler.render(force);
            }

            preRender(): void | false {}
            postRender() {}
            connectedCallback() {
                this.#renderHandler.connected();
            }
            disconnectedCallback() {
                this.#renderHandler.disconnected();
            }
            mounted() {}
        };
}
