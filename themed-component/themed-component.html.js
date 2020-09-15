import { render, html } from '../modules/lit-html-bundled/lit-html.js';
import { TemplateFn } from '../modules/wc-lib/wc-lib.js';
export const ThemedComponentHTML = new TemplateFn(function () {
    return html `
            <div id="horizontal-centerer">
                <div id="vertical-centerer">
                    <div id="background">
                        <h1 id="primary">Primary color</h1>
                        <h2 id="secondary">Secondary color</h2>
                        <div id="regular">Regular text</div>
                        <button
                            class="theme-option active"
                            id="light"
                            @click="${() => {
        this.changeTheme('light');
    }}"
                        >
                            Light mode
                        </button>
                        <button
                            class="theme-option"
                            id="dark"
                            @click="${() => {
        this.changeTheme('dark');
    }}"
                        >
                            Dark mode
                        </button>
                    </div>
                </div>
            </div>
        `;
}, 1 /* PROP */, render);
