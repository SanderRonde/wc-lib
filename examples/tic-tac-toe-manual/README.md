# Tic Tac Toe (manual updates)

This example serves as a demo of manual updating using watching of values

## How it works

Manually updated values use the idea of only updating a value where it's used and not doing a complete re-render of the page. To do this, we use `lit-html`'s directives, which allow the setting of parts' (basically a representation of any used template value) values at any time. For example the following directive:

```ts
const waitFor = directive(
    (promise: Promise<any>, placeholder: string) => (part) => {
        part.setValue(placeholder);
        part.commit();

        promise.then((value) => {
            part.setValue(value);
            part.commit();
        });
    }
);

function someAsyncFetch() {
    return new Promise((resolve) => {
        setTimeout(() => resolve('value'), 5000);
    });
}

const template = html`<div>${waitFor(someAsyncFetch(), 'placeholder')}</div>`;

// Results in
// <div>placeholder</div>
// ... and after 5 seconds
// <div>123</div>
```

Allows you to wait for `someAsyncFetch`'s value and have `placeholder` as the placeholder. We can use this to update the part whenever the underlying value changes, which is great since that is the whole idea behind `props` and `i18n`. Unfortunately we can't apply the same logic to `theme`s because lit html does not support parts within CSS style tags.
