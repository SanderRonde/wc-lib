# wc-lib

[![Build Status](https://github.com/SanderRonde/wc-lib/actions/workflows/test-and-coverage.yml/badge.svg)](https://github.com/SanderRonde/wc-lib/actions/workflows/test-and-coverage.yml)
[![npm version](https://badge.fury.io/js/wc-lib.svg)](https://badge.fury.io/js/wc-lib)
[![codecov](https://codecov.io/gh/SanderRonde/wc-lib/branch/master/graph/badge.svg)](https://codecov.io/gh/SanderRonde/wc-lib)

A small library for creating webcomponents based around the idea of importing what you need, boasting 100% code coverage. Has out of the box support for server-side rendering, I18N, themes, smart templates (that only render when they have to and that use [adopted stylesheets](https://wicg.github.io/construct-stylesheets/)), custom event listening/firing and a smart custom property system that allows you to pass a reference to any value through HTML (yes even objects and HTML elements).

See below for more detailed explanations of these features, [check out the demo](https://wc-lib.sanderron.de/) or [install the npm package](https://www.npmjs.com/package/wc-lib)

## Getting started

### Hello world

Running the following code will define the `hello-world` component for you, making sure any future uses of `<hello-world></hello-world>` contain the text "Hello World!":

```tsx
@config({
    is: 'visitor-count', // Define the tag name
    html: new TemplateFn<VisitorCount>( // Define an HTML template
        (html, props) => {
            return html` <div>Visitors: ${props.count}</div> `;
            // OR if you want to use JSX
            return <div>{`Visitors: ${props.count}`}</div>;
        },
        CHANGE_TYPE.PROP, // Re-render this if any props change
        render
    ),
    css: null, // (optional) We don't use a CSS template yet so this is null
    dependencies: [], // (optional) We have no dependencies so this is empty
})
export class VisitorCount extends ConfigurableWebComponent {
    props = Props.define(this, {
        reflect: {
            // Reflect any properties back to the component's attributes
            count: {
                // Define the "count" property
                type: PROP_TYPE.NUMBER, // It's a number
                value: 0, // (optional) That defaults to 0 if not provided
            },
        },
    });
}
```

From here the way forward is to modify the contents of your HTML template, possibly add a CSS template, add some other properties or to run some code on-mount.

### Creating a component

The easiest way to get started is to use the command-line tool to generate a component for you. First make sure to install the library through npm or yarn (`npm install --global wc-lib` or `yarn global add wc-lib`) as well as installing [lit-html](https://github.com/Polymer/lit-html) to your project. Then use the `wc-lib create --name "my-element"` command to generate a component in `./my-element` (you can use the `-j` flag to use TSX instead of `template strings`). At this point it's as simple as modifying the template files (`./my-element/my-element.html.ts` and `./my-element/my-element.css.ts`) to change what is rendered, and you can edit the class definition itself (`./my-element/my-element.ts`) to change any properties and methods it has. Then make sure to call `MyElement.define()` somewhere in your code or add it as a dependency of another one to make sure it's defined and at that point any `<my-element>` tags will render your element instead.

## Examples

Check out the `/examples` directory for any example code or check them out [online](https://wc-lib.sanderron.de).

## Features

### Server-side rendering

Server side is easily done by passing the component to the `ssr` function with the props, attributes, i18n and theme you want. The resulting string is ready to be sent to the client. Thanks to webcomponents and shadowroots, loading the original JS and defining the component immediately "hydrates" the component. This replaces it with an actual webcomponent instance (instead of raw HTML) and allows for its JS and handlers to run.

### Smart template system

The templating system consists of two parts. The part that renders them and the part that generates them (the part that features the custom properties). The part that renders them allows you to specify when to render certain templates. CSS stylesheets for example, don't need to be re-rendered when the language changes or when a property changes but they do need to be re-rendered when the theme changes. You can specify this for all templates (and you can choose multiple ones as well), making sure no unnecessary work is done. Stylesheets that are the same across all instances of a component are also merged into one, using [adopted stylesheets](https://wicg.github.io/construct-stylesheets/) to only update them once for all instances on the page.

### Custom properties

The templates themselves allow you to pass custom values through attributes by using special names. In the following examples the templating library that is used under the hood is [lit-html](https://github.com/Polymer/lit-html). However, any templating engine, even your own or none at all (returning plain text) can be used. For example using

```js
html` <div @click="${this.someListener}"></div> `;
```

allows you to run a handler when the 'click' event is fired. Using

```js
html` <div #some-value="${this}"></div> `;
```

allows you to pass a reference to any value that is returned when `div['some-value']` is accessed. This allows you to easily refer to a parent component or another object. The library features a lot more of these special attributes prefixes. This can be combined with you having the ability to create pre-defined properties that should be watched on a component. When one of them changes, the corresponding templates are re-rendered.

### I18N

The i18n support only requires you to pass the path to your i18n files and a default language. Handling language changes, switching all elements on the page to that language, re-rendering them and handling any conflicts that might occur is all done by the library. Using the templating system, using i18n is as simple as the following line.

```js
html` <div>${this.__('my-key')}</div> `;
```

If you provide the library with typescript definitions for your i18n files, these keys will be typed as well, making sure you never end up with placeholders on the page.

Changing languages is easy as well. Simply call `this.setLang('newlang')` on **any** component and the rest is done automatically for all elements on the page.

### Theming

Theming support work similar to i18n support. It allows you to use the same theme globally, change them all at once and only re-render the templates that should be re-rendered. Here's a small example:

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
};
```

Again changing the theme is very easy. Simply call `this.setTheme('my-theme-name')` on **any** component and the rest is done automatically for all elements on the page.

### Custom events

A simple event listener system with custom events allows you to listen to and fire custom events on components. The listener system also allows you to listen to specific child element IDs on re-render for example. This ensures that a listener is always present on the currently rendered version of the element. This takes away the pain of a templating system that re-renders elements often.

### Typescript

This library is largely built around typescript support and being 100% sure your code is free of typos in the IDs, classes or attributes of elements. This ensures you always know where and if things are being used, from i18n, to themes, properties and CSS. Basically everything can be typed.

#### Properties

The property system for example, allows you to define properties on an element along with types that are then enforced. This way you know for sure that you're accessing the right properties. (See [below](#props) for a full config list)

#### Typed events

The custom events that can be listened to for a given component can be specified in the class' type as well. This way you always know what events a specific component delivers and what arguments and return values they have.

#### JSX

The library also features support for JSX. Combining JSX with typed properties and events makes sure you even have type safety in your "HTML", ensuring you only pass the correct types of values to properties. **Note:** Put `{"jsx": "react", "jsxFactory": "html.jsx", "jsxFragmentFactory": "html.Fragment"}` in your tsconfig's compiler options since passing React elements won't work (React is not supported, only JSX is).

#### HTML and CSS Typings

Using [html-typings](https://github.com/SanderRonde/html-typings) (coincidentally created by the same author as this library), you can infer typings from your templates. wc-lib then allows you to use these typings for a few things. The first is one is that every component has a `$` property that contains an id-mapped list of all of its children. When you pass the generated HTML typings, this allows you to easily and reliably refer to child elements through `this.$.somechild`, while ensuring ID is correct but also returning the correct type (check the html-typings repo/demo for more info).

The second thing this is used for is for typed CSS. Something that often happens to websites is that they feature unused CSS. It can be very hard to get rid of this since you might never know if a click somewhere triggers some code that adds a class that is eventually used by your CSS. This is why this library allows you to use typed CSS. This way you only generate selectors that you know are actually used. Here's an example:

```js
const enum STATES {
	TOGGLED = "toggled"
}
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

	${css(this).class.button.toggle.toggled} {
		font-weight: bold;
	}
</style>`;
```

If any of these elements (`#something-red, input, .purple, .button`) were to be removed from your HTML, you'd notice the type error and you could remove the offending CSS rule. You could also pass in enums. This can be great when combined with toggled classes. Say for example, that you have some code that applies a `toggled` style to some input element. You could instead apply `STATES.TOGGLED`, after which you pass the `STATES` enum to the toggle types, which allows you to pick `toggled` as a togglable state. This way your CSS can reference your code, adding even more type safety. It also has the benefit of removing the possibility of any typos in your CSS which can be a huge cause of frustration. See [below](#Typed-CSS) for the full custom css documentation.

## Reference

### Props

A property takes a single type (for example `PROP_TYPE.STRING`) or a config object. The config object is described below.

```ts
{
	// Watch this property for changes. In objects, setting this to true
	// means that any of its keys are watched for changes (see watchProperties)
	//
	// NOTE: This uses Proxy to watch objects. This does mean that
	// after setting this property to an object, getting that same
	// property will return a proxy of it (which is not strictly equal)
	// If you do not want this or have environments that do not yet
	// support window.Proxy, turn this off for objects
	watch?: boolean = true;
	// The type of this property. Can either by a PROP_TYPE:
	// PROP_TYPE.STRING, PROP_TYPE.NUMBER or PROP_TYPE.BOOL
	// (or their _OPTIONAL and _REQUIRED variants),
	// or it can be a complex type passed through ComplexType<TYPE>().
	// ComplexType should be used for any values that do not fit
	// the regular prop type
	type: PROP_TYPE|ComplexType<any>;
	// The default value of this component. Should be of the same
	// type as this prop's value (obviously). Will be undefined if not set
	defaultValue?: this.type;
	// A synonym for defaultValue
	value?: this.type;
	// The properties to watch if this is an object. These can contain
	// asterisks and can go multiple properties deep. ** will watch any
	// properties, even newly defined ones.
	// For example:
	// 	['x'] only watched property x,
	//  ['*.y'] watches the y property of any object values in this object
	//  ['z.*'] watches any property of the z object
	watchProperties?: string[] = [];
	// The exact type of this property. This is not actually used and
	// is only used for typing.
	// Say you have a property that can have the values 'text', 'password'
	// or 'tel' (such as the html input element). This would mean that
	// the type is a string (PROP_TYPE.STRING). This does however not fully
	// express the restrictions. Doing
	// { type: PROP_TYPE.STRING, exactType: '' as 'text'|'password'|'tel' }
	// Will apply these restrictions and set the type accordingly
	exactType?: any;
	// Coerces the value to given type if its value is falsy.
	// String values are coerced to '', bools are coerced to false
	// and numbers are coerced to 0
	coerce?: boolean = false;
	// Only relevant for type=PROP_TYPE.BOOL
	// This only sets a boolean value to true if the property was set to
	// the string "true". Normally any string that is not equal
	// to the string "false" will be taken as a true value.
	//
	// For example, if strict=false
	// <my-component bool_1="a" bool_2="false" bool_3="" bool_4="true">
	// bool_1, bool_3 and bool_4 are true while bool_2 is false (and any
	// other bools are false as well since no value was supplied)
	//
	// For example, if strict=true
	// <my-component bool_1="a" bool_2="false" bool_3="" bool_4="true">
	// bool_4 is true and the rest is false
	strict?: boolean = false;
	// Whether to reflect this property to the component itself.
	// For example, if set to true and the property is called "value",
	// accessing component.value will return the value of that property.
	reflectToSelf?: boolean = true;
	// If true, the type of this property is assumed to be defined
	// even if no default value was provided. This is basically
	// the equivalent of doing `this.props.x!` in typescript.
	// This value is not actually used in any way except for typing.
	isDefined?: boolean = false;
	//
	// Whether this parameter is required. False by default.
	// Currently only affects the JSX typings.
	// This value is not actually used in any way except for typing.
	//
	required?: boolean = false;
}
```

### Typed-CSS

The `css()` function itself can be called in two ways. Either with or without a parameter. If called with a parameter (which should be a component instance `this`), the types are inferred from that parameter. If called without one, you should pass the type of that component as a generic argument (for example `css<MyComponent>()`) instead to make sure types can be inferred.

The `css()` function returns a class which we'll call `CSS` that can be chained off of. It has a few properties.

-   The `$`, `i` and `id` properties contain objects with the ID keys (previously passed through step one of Typed CSS) as its keys.
-   The `class` and `c` properties do the same except with class keys.
-   The `tag` and `t` do the same but with tags.

These each return another class which we'll call a `CSSSelector` with different properties.

-   The `and` property returns a class map. For example `css(this).$.x.and.y` resolves to `#x.y`. This returns another `CSSSelector` (and as such can be chained).
-   The `or` property returns another `CSS` class. For example `css(this).$.x.or.$.y` resolves to `#x, #y`.
-   The `orFn` method can be called with another `CSSSelector` in order to merge them. For example `css(this).$.x.orFn(css(this).$.y)` resolves to `#x, #y` as well.
-   The `toggle` property returns an object with all possible toggle values as keys. For example `css(this).$.x.toggle.y` resolves to `#x.y`.
-   The `toggleFn` method takes a variable number of arguments where the arguments must all be possible toggle values. For example `css(this).$.x.toggleFn('y', 'z')` resolves to `#x.y.z`.
-   The `attr` property returns an object with all possible attribute values as keys. For example `css(this).$.x.attr.y` resolves to `#x[y]`. Note that this way you can not set values
-   The `attrFn` method takes an attribute as a key and an optional value for it. For example `css(this).$.x.attrFn('y', 'z')` resolves to `#x[y="z"]`.
-   The `toString` method will convert the whole thing to a valid CSS selector. This is done implicitly in the templates and is not something you have to think about but it can be handy to debug it.

**Note**: If at any time you see a question mark as a suggestion instead of something else you expected, you've probably done something wrong.

## Changelog


**1.2.8**:

-   Fix property part

**1.2.7**:

-   Support `lit-html` `PropertyPart`

**1.2.6**:

-   Make sure `package.json` fields point to correct files

**1.2.5**:

-   Automatically infer complex components regardless of casing

**1.2.4**:

-   Fix bug with parent props' types not being detected
-   Fix bug in JSX rendering

**1.2.3**:

-   Fix bug that caused rendering before props were set through global property updating
-   Fix bug that caused JSX to render as `[object Object]`

**1.2.2**:

-   Define JSX components on-demand

**1.2.1**:

-   Mark module as side effects free

**1.2.0**:

-   Implement subtree prop providers (similar to react context)
-   Implement manual rendering and watching of props, themes, languages, and global/subtree props (see manual tic-tac-toe example)

**1.1.36**:

-   Improve props and JSX type inference

**1.1.35**:

-   Make argument to `TemplateFn` an object
-   Add shortcuts for optional and required prop types. For example `PROP_TYPE.STRING_REQUIRED` translates to `{ type: PROP_TYPE.STRING, required: true }` and `PROP_TYPE.STRING_OPTIONAL` translates to `{ type: PROP_TYPE.STRING, required: false }`

**1.1.34**:

-   Upgrade to TS 4.0

**1.1.33**:

-   Add event listeners for attributes prefixed with `on-`

**1.1.32**:

-   Use `any` instead of removing references

**1.1.31**:

-   Don't export type so that no reference to a non-required library is present in the .d.ts file

**1.1.30**:

-   Run only the latest and most important property setter (manual set > default value)

**1.1.29**:

-   Fix issue with `setAttribute`s called before mounting not being ran aftewards

**1.1.28**:

-   Apply attributes set before component connect immediately in its `onConnect` function (before rendering).

**1.1.27**:

-   Add JSX fragments (`html.Fragment` or `html.F`)

**1.1.26**:

-   Fix a whole bunch of server-side rendering bugs

**1.1.25**:

-   Fix issue with rendering multiple templates as a single node's child

**1.1.24**:

-   Fix test

**1.1.23**:

-   Fix bug with language only being updated if it's unloaded

**1.1.22**:

-   Set default value for JSX component attributes

**1.1.21**:

-   Only ignore renders if `changeOn === CHANGE_TYPE.NEVER`, not on `changeOn & CHANGE_TYPE.NEVER`

**1.1.20**:

-   Type `.$$(...)` selection

**1.1.19**:

-   Convert style object to string automatically

**1.1.18**:

-   Fix typing issue for JSX

**1.1.17**:

-   Fix bug with multiple args not working for custom event listeners

**1.1.16**:

-   Now autodetects complex attributes, allowing you to use them without prefacing with `#`
-   Ignores JSX children with the value `false`. So that `{condition && <div></div>}` is possible
-   Don't deeply watch RegExps and Dates

**1.1.15**:

-   Add JSX mode to command-line tool
-   Make sure no TS warnings occur on initial creation (no unused params)

**1.1.14**:

-   Fix `required` option not doing anything for jsx proptypes
-   Update TS to 3.9.5

## License

```text
The MIT License (MIT)

Copyright (c) 2019 Sander Ronde

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
