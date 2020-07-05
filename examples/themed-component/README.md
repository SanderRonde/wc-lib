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

This starts with defining all elements by their IDs, classes and tags. This can be done manually or by using the [html-typings](https://github.com/SanderRonde/html-typings) module. In this case toggles have also been defined. These are toggles that can be turned on or off. The `TOGGLES` key has 4 keys named "IDS", "TAGS", "CLASSES" and "SELECTORS". They basically mirror the regular selectors except they have a string as a value instead of an element. This string is the string that can be toggled on or off. You can also pass as const enum, which allows you to refer to that const enum when adding to or removing from the classlist. The `ATTRIBUTES` key is basically the same as the `TOGGLES` key except that it specifies possible attributes.

You can see an example of the actual typed CSS in `themed-component.css.ts`. It works by calling `css(this)` and then chaining off of that. See below for a full explanation of how this function works. The values returned are used as CSS selectors. You can also toggle on an extra property as can be seen in the last selector, where `.toggle.active` has been used to select for `.theme-option.active`. You can see this same toggle being used in `themed-component.ts` to add to the classlist.

# css() reference

See `README.md` in the root of the project for details.
