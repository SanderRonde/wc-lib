import {
    ConfigurableWebComponent,
    config,
    TemplateFn,
    CHANGE_TYPE,
    Props,
    PROP_TYPE,
} from '../../build/es/wc-lib.js';
import { render, html } from '../../node_modules/lit-html/lit-html.js';

@config({
    is: 'simple-clock',
    html: new TemplateFn<SimpleClock>(
        (_, { props }) => {
            return html`
                <div>
                    Right now ${props.seconds} seconds have passed
                </div>
            `;
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
})
export class SimpleClock extends ConfigurableWebComponent {
    private _startClock() {
        window.setInterval(() => {
            this.props.seconds++;
        }, 1000);
    }

    props = Props.define(this, {
        reflect: {
            seconds: {
                type: PROP_TYPE.NUMBER,
                value: 0,
            },
        },
    });

    mounted() {
        this._startClock();
    }
}
