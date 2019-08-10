# Stop-watch

A stop-watch implementation

**Note**: In order for the complex template provider to work, it needs to be initialized with certain lit-html values. For an example, see `index.ts`.

## How it works

This component uses the complex template provider to add event listeners a bit easier. They work by prefixing properties with a special character that then handles the property and the value differently. For all complex template properties check the list below. 

This example uses `@click` (see `stop-watch.html.ts`). The `@` part signifies an event listener and the `click` part is the event listener. The value for it is then a function that is called when the event is triggered. Adding this to an HTML button element causes the function to be called when they are clicked. Apart from that the logic is fairly simple. For a better explanation of how the `props` object is used check out the `simple-clock` example.