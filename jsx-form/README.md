# JSX Form

This component is an example of using JSX with this library.

**Note**: Do make sure to always set `jsxFactory` to `html.jsx` in your tsconfig file (see ../tsconfig.json). Also make sure to take the first argument the templating function provides and be sure to name it `html`. You can also use your own JSX->template function and your own template->render function but if you don't, make sure to use these settings.

## How it works

Using JSX is fairly simple with this library. Simply return the JSX value in the template function (see `jsx-form.html.tsx`) and it will work. The only thing you need to take care of is providing JSX definitions since those don't ship with this library. You can use a section of the `@types/react` module for example. One thing you want to do is defining `JSX.ElementAttributesProperty` to be equal to `{ jsxProps: 'jsxProps'; }`. This is where components' jsx properties are stored and makes sure a component's props and events are correctly translated to JSX-readable types.

One annoying thing about JSX is that it does not allow property names that start with custom characters (except for some). This means that using `@click` or `#ref` will not work. To circumvent this you can use something like `{...{"@click": fn }}`. Since it's not possible to generate typings for this, this will be an untyped property. For this reason it's better to use `{...{"@": { "eventName": listener }}}` which is used in `jsx-input.tsx`. In order to set the type definitions for this, set `JSX.IntrinsicAttributes` to something that extends `JSXIntrinsicProps`.