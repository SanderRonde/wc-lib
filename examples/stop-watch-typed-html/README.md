# Stop-watch with typed HTML

A stop-watch implementation using typed HTML instead of the complex template provider

This component uses typed HTML instead of the complex template provider. As a result most of the logic is inside of the main component file instead of the template. This mainly serves as an example of what typed HTML can do. Generally you'll want to use the complex template provider and to reserve typed HTML for better use cases than this (in which you need to get specific elements by ID).

## How it works

This is basically the `stop-watch` example but without the complex template provider. Instead, all values are set manually and all listeners are added manually. In order to keep this all type-safe, a map of the selectors of the HTML template is provided. This map can be created manually or it can be generated with the [html-typings](https://github.com/SanderRonde/html-typings) module. 

For example, this allows referring to `this.$.start` to return an `HTMLButtonElement` (the type of a button) instead of a generic HTML element. If this were an input element, referring to `this.$.input.value` would work, where `getElementById('input').value` would fail since `getElementById` returns `HTMLElement` which has no `value` property.

Except for the listeners, everything is quite straightforward. The HTML content is set through `this.$.id.innerText` (see `stop-watch-typed.html.ts` for examples). The listeners are added through `Listeners.listenIfNew`. This function always makes sure to listen to the newest version of an element. For example when a template is re-rendered, new elements are rendered and old ones are removed. It's best to remove event listeners from old elements or you'll end up with loads of listeners to non-existent elements. The first argument to `listenIfNew` is the component itself. This will be used as the context in which the element is seen as "new". The second argument is the ID of the element to listen to. The third one is the event and the last one is the listener. Together the listeners in the `render` function make sure to listen to all events on the buttons.