[![Build Status](https://travis-ci.org/SanderRonde/wc-lib.svg?branch=master)](https://travis-ci.org/SanderRonde/wc-lib)
[![Coverage Status](https://coveralls.io/repos/github/SanderRonde/wc-lib/badge.svg)](https://coveralls.io/github/SanderRonde/wc-lib)

# Wc-lib

A small library for creating webcomponents based around the idea of importing what you like. Has **optional** support for I18N, themes, smart templates (that only render when they have to and use [adopted stylesheets](https://wicg.github.io/construct-stylesheets/)), custom event listening/firing, a smart custom property system that allows you to pass any value through HTML (yes even objects and HTML elements).

See below for more detailed explanations of these features.

## Features

### Smart template system

The templating system consists of two parts. The part renders them and the part that generates them (the part that features the custom properties). The part that renders them allows you to specify when to render certain templates. CSS stylesheets for example, don't need to be re-rendered when the language changes or when a property changes but they do need to be re-rendered when the theme changes. You can specify this for all templates (and you can choose multiple ones as well), making sure no unnecessary work is done. Stylesheets that are the same across all instances of a component are also merged into one, using [adopted stylesheets](https://wicg.github.io/construct-stylesheets/) to only render them once.

### Custom properties

The templates themselves allow you to pass custom values through attributes by using special names. In the following examples the templating library that is used under the hood is [lit-html](https://github.com/Polymer/lit-html). However, any templating engine, even your own or none at all (returning plain text) can be used. For example using 
```js
html`<div @click="${this.someListener}"></div>`;
```
allows you to run a handler when the 'click' event is fired. Using 
```js
html`<div #some-value="${this}"></div>`;
```
allows you to pass a reference to any value that is returned when `div['some-value']` is accessed. This allows you to easily refer to a parent component or another object. The library features a lot more of these special attributes prefixes. This can be combined with you having the ability to create pre-defined properties that should be watched on a component. When one of them changes, the corresponding templates are re-rendered.

### I18N

The i18n support only requires you to pass the path to your i18n files and a default language. Handling language changes, switching all elements on the page to that language, re-rendering them and handling any conflicts that might occur are all done by the library. Using the templating system, using i18n is as simple as the following line.

```js
html`<div>${this.__('my-key')}</div>`;
```

If you provide the library with typescript definitions for your i18n files, these keys will be typed as well, adding some more security.

Changing languages is easy as well. Simply call this.setLang('newlang') on any component and the rest is done automatically.

### Theming

Theming support work similar to i18n support. It allows you to use the same theme globally, change them all at once and only re-render the templates that should be. Here's a small example:

```js
(html, props, theme) => {
	html`<style>
		.text {
			color: ${theme.text};
		}

		.background {
			background-color: ${theme.primary};
		}
	<style>`;
}
```

### Custom events

A simple event listener system with custom events allows you to listen to and fire custom events on components. The listener system also allows you to listen to specific child element IDs on re-render for example. This ensures that a listener is always present on the currently rendered version of the element. This takes away the pain of a templating system that re-renders elements often.


### Typescript

This library is largely built around typescript support and being 100% sure your code is free of typos in the IDs, classes or attributes of elements. 

#### Properties

The property system for example, allows you to define properties on an element along with types that are then enforced. This way you know for sure that you're accessing the right properties.

#### Typed events

The custom events that can be listened to for a given component can be specified in the class' type as well. This way you always know what events a specific component delivers and what arguments they have. 

#### JSX
The library also features support for JSX. Combining JSX with typed properties and events makes sure you even have type safety in your HTML, making sure you only pass the correct types of values to properties.

#### HTML and CSS Typings

Using [html-typings](https://github.com/SanderRonde/html-typings) (coincidentally created by the same author as this library), you can infer typings from your templates. Wc-lib then allows you to use these typings for a few things. The first is one is that every component has a `$` property that contains an id-mapped list of all of its children. When you pass the generated HTMl typings, this allows you to easily and reliably refer to child elements through `this.$.somechild`, while ensuring ID is correct but also returning the correct type (check the html-typings repo for more info). 

The second thing this is used for is for typed CSS. Something that often happens to websites is that they feature unused CSS. It can be very hard to get rid of this since you might never know if a click somewhere triggers some code that adds a class that is eventually used by your CSS. This is why this library allows you to use typed CSS. This way you only generate selectors that you know are actually in your HTML template. Here's an example:

```js
html`<style>
	${css(this).id['something-red']} {
		color: red;
	}

	${css(this).tag.input} {
		outline: none;
	}

	${css(this).class.purple} {
		background-color: purple;
	}

	${css(this).class.button.toggle.hover} {
		font-weight: bold;
	}
</style>`;
```

If any of these elements were to be removed from your HTML, you'd notice the type error and you could remove the offending CSS rule. It also has the benefit of removing the possibility of any typos in your CSS which can be a huge cause of frustration.