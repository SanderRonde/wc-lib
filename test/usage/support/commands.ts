/// <reference types="Cypress" />

interface WaitOptions {
	interval?: number;
	timeout?: number;
	message?: string;
}

function waitsFor(promiseChecker: () => boolean, options: WaitOptions = {}) {
	var func = promiseChecker, // this function returns true when promise is fufilled
	 	intervalTime = options.interval || 10;
  
	return new Promise(function (fufill, reject) {
		var interval = setInterval(function () {
			if (func()) {
				clearTimeout(timeout);
				clearInterval(interval);
				fufill();
			}
		}, intervalTime);
	
		var timeout = setTimeout(function () {
			clearInterval(interval);
			reject(
				new Error(`Timed out retrying: ${options.message || ''}`)
			);
		}, options.timeout || 3900);
	});
  }

function shadow(subject: Cypress.Chainable<JQuery<HTMLElement>>, passedOptions?: WaitOptions) {  
	const options = {...{}, ...passedOptions, ...{
		message: `Expected to find element shadowroot but never found it.`,
	}};
  
	// setup log to start spinner off
	const log = Cypress.log({
	  	message: [subject, 'Finding shadowroot']
	});
  
	let foundElements: ShadowRoot[];
  
	// returning promise => spinner
	return waitsFor(() => {
		foundElements = [...subject as any].map(s => s.shadowRoot).filter(root => !!root);
		return foundElements.length > 0;
	}, options).then(() => {
		// setting found $el on log to mimic cypress logging
		log.set('$el', Cypress.$(foundElements) as any);
		return foundElements;
	})
	.catch((err) => {
		throw err;
	});
}

function findDataType(dataType: string) {
	return (subject: Cypress.Chainable<JQuery<HTMLElement>>, passedOptions?: WaitOptions) => {
		// setup log to start spinner off
		const log = Cypress.log({
			message: [subject, `Finding ${dataType} element`]
		});

		return new Promise((resolve) => {
			shadow(subject, passedOptions).then((elements) => {
				const htmlSlots = [...elements
					.map(el => el.querySelector(`[data-type="${dataType}"]`))
					.filter(el => !!el)
				];
				log.set('$el', Cypress.$(htmlSlots) as any);
				resolve(htmlSlots);
			});
		});
	}
}

declare namespace Cypress {
	interface Chainable {
		shadow(options?: WaitOptions): Cypress.Chainable<JQuery<HTMLSpanElement>>;
		html(options?: WaitOptions): Cypress.Chainable<JQuery<HTMLSpanElement>>;
		css(options?: WaitOptions): Cypress.Chainable<JQuery<HTMLSpanElement>>;
		customCSS(options?: WaitOptions): Cypress.Chainable<JQuery<HTMLSpanElement>>;
	}
}

Cypress.Commands.add('html', {
	prevSubject: true
}, findDataType('html'));
Cypress.Commands.add('shadow', {
	prevSubject: true
}, findDataType('html'));
Cypress.Commands.add('css', {
	prevSubject: true
}, findDataType('css'));
Cypress.Commands.add('customCSS', {
	prevSubject: true
}, findDataType('custom-css'));