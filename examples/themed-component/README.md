# Themed component & Typed CSS

A component that serves as an example of how to use theming and typed CSS.

# How it works

## Theming

First a theme is defined in `index.ts`. This theme is an object where the keys are the names of the themes and the values are the themes themselves. These theme values can be of any format.

Then the `WebComponent.initTheme` function is called, telling the library what the theme is (the one that was just created) and what the default theme is (in this case a light theme).

All of the theming happens in the `themed-component.css.ts` file. Here, `theme` is passed as the third argument of the templating function. This is then one of the theme values you defined before. In this case it has the "background", "primary", "secondary" and "regular" keys. You can then access this `theme` object in the css template and substitute them for regular color values. For example `background-color: ${theme.background}`.

Changing themes happens by calling `this.setTheme('themeName')` on the component (which you can see in `themed-component.ts`).

## Typed CSS

**Note:** Use the typed CSS inliner in wc-lib/tasks/typed-css to inline typed CSS in your compiled code to prevent unneeded client-side work.

This starts with defining all elements by their IDs, classes and tags. This can be done manually or by using the [html-typings](https://github.com/SanderRonde/html-typings) module. In this case toggles have also been defined. These are toggles that can be turned on or off. The `TOGGLES` key has 3 keys named "IDS", "TAGS" and "CLASSES". They basically mirror the regular selectors except they have a string as a value instead of an element. This string is the string that can be toggled on or off. You can also pass as const enum, which allows you to refer to that const enum when adding to or removing from the classlist. The `ATTRIBUTES` key is basically the same as the `TOGGLES` key except that it specifies possible attributes.

You can see an example of the actual typed CSS in `themed-component.css.ts`. It works by calling `css(this)` and then chaining off of that. See below for a full explanation of how this function works. The values returned are used as CSS selectors. You can also toggle on an extra property as can be seen in the last selector, where `.toggle.active` has been used to select for `.theme-option.active`. You can see this same toggle being used in `themed-component.ts` to add to the classlist.

# css() reference

The `css()` function itself can be called in two ways. Either with or without a parameter. If called with a parameter (which should be a component instance), the types are inferred from that parameter. If called without one, you should pass the type of that component as a generic argument (for example `css<MyComponent>()`) instead to make sure types can be inferred.

This function returns a class which we'll call `CSS` that can be chained off of. It has a few properties.
* The `$`, `i` and `id` properties contain objects with the ID keys (previously passed through step one of Typed CSS) as its keys. 
* The `class` and `c` properties do the same except with class keys.
* The `tag` and `t` do the same but with tags.

These each return another class which we'll call a `CSSSelector` with different properties. 
* The `and` property returns a class map. For example `css(this).$.x.and.y` resolves to `#x.y`. This returns another `CSSSelector` (and as such can be chained).
* The `or` property returns another `CSS` class. For example `css(this).$.x.or.$.y` resolves to `#x, #y`.
* The `orFn` method can be called with another `CSSSelector` in order to merge them. For example `css(this).$.x.orFn(css(this).$.y)` resolves to `#x, #y` as well.
* The `toggle` property returns an object with all possible toggle values as keys. For example `css(this).$.x.toggle.y` resolves to `#x.y`.
* The `toggleFn` method takes a variable number of arguments where the arguments must all be possible toggle values. For example `css(this).$.x.toggleFn('y', 'z')` resolves to `#x.y.z`.
* The `attr` property returns an object with all possible attribute values as keys. For example `css(this).$.x.attr.y` resolves to `#x[y]`. Note that this way you can not set values
* The `attrFn` method takes an attribute as a key and an optional value for it. For example `css(this).$.x.attrFn('y', 'z')` resolves to `#x[y="z"]`.
* The `toString` method will convert the whole thing to a valid CSS selector. This is done implicitly in the templates and is not something you have to think about but it can be handy to debug it.

**Note**: If at any time you see a question mark instead of something else you expected, you've probably done something wrong.