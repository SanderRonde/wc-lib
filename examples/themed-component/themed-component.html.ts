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
					<button class="theme-option" id="light" @click="${() => {
						this.changeTheme('light');
					}}">Light mode</button>
					<button class="theme-option" id="dark" @click="${() => {
						this.changeTheme('dark');
					}}">Dark mode</button>
				</div>
			</div>
		</div>
	`
}, CHANGE_TYPE.PROP, render);
