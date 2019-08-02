import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { ThemedComponent } from './themed-component.js';
import { html, render } from 'lit-html';

export const ThemedComponentHTML = new TemplateFn<ThemedComponent>(function () {
	return html`
		<div id="horizontal-centerer">
			<div id="vertical-centerer">
				<div id="background">
					<h1 id="primary">Primary color</div>
					<h2 id="secondary">Secondary color</div>
					<div id="regular">Regular text</div>
					<button @click="${() => {
						this.setTheme('light');
					}}">Light mode</button>
					<button @click="${() => {
						this.setTheme('dark');
					}}">Dark mode</button>
				</div>
			</div>
		</div>
	`
}, CHANGE_TYPE.PROP, render);
