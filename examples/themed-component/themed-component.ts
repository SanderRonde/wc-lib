import { ConfigurableWebComponent, config } from '../../src/wclib';
import { ThemedComponentHTML } from './themed-component.html.js';
import { ThemedComponentCSS } from './themed-component.css.js';
import { theme } from './index.js';

const enum BUTTON_STATE {
	ACTIVE = 'active'
}

@config({
	is: 'themed-component',
	css: ThemedComponentCSS,
	html: ThemedComponentHTML
})
export class ThemedComponent extends ConfigurableWebComponent<{
	selectors: {
		IDS: {
			"horizontal-centerer": HTMLDivElement;
			"vertical-centerer": HTMLDivElement;
			background: HTMLDivElement;
			primary: HTMLHeadingElement;
			secondary: HTMLHeadingElement;
			regular: HTMLDivElement;
			light: HTMLButtonElement;
			dark: HTMLButtonElement;
		};
		CLASSES: {
			"theme-option": HTMLButtonElement;
		};
		TAGS: {
			div: HTMLDivElement;
			h1: HTMLHeadingElement;
			h2: HTMLHeadingElement;
			button: HTMLButtonElement;
		};
		TOGGLES: {
			TAGS: {
				button: BUTTON_STATE;
			};
			IDS: {
				light: BUTTON_STATE;
				dark: BUTTON_STATE;
			};
			CLASSES: {
				"theme-option": BUTTON_STATE;
			}
		}
	}
	themes: typeof theme;
}> { 
	changeTheme(color: 'dark'|'light') {
		Array.from(this.querySelectorAll('.theme-option')).forEach((option) => {
			option.classList.remove(BUTTON_STATE.ACTIVE);
		});
		this.$[color].classList.add(BUTTON_STATE.ACTIVE);
		this.setTheme(color);
	}
}