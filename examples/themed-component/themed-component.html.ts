import { render, html } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../build/es/wc-lib.js';
import { ThemedComponent } from './themed-component.js';

export const ThemedComponentHTML = new TemplateFn<ThemedComponent>(
    function() {
        return html`
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
    },
    CHANGE_TYPE.PROP,
    render
);
