##

```tsx

// The renderer can register a bunch of modules, such as props, theme, i18n, redux

// Everything is a module
//	can be loaded in with either dependency injection
// TODO: not sure if that's possible because there is no global thing creating them
class X {
	constructor(private _xd: PropsModule) {}
}
//	or by defining them in the class
class Root {
	protected props: PropsModule;
}
// Might be possible to put them in the @config

// All templating happens in JSX
// This means there is no need to get the type of props
// However props need to be configurable in some way,
// where the type is allowed to be specified in order
// to provide compatibility with native webcomponents

// Using static analysis, we can do a few things:
// Figure out what props are used through props.x etc
// This allows us to pre-populate the information about what is accessed
// Figure out what properties are being used in what subtree
// Maybe even figure out what I18N is being used and what isn't

// Typed CSS is still a thing

// Custom-css is not, we can use style object and if it's template,
// we render that template in the component

// Hierarchy manager is a module now

// Same for I18N

// JSX is parsed then do some VDOM comparing to render it

// Template manager is configurable as well, so modules can
// hook into the templates.

// Event listeners are a module. Types are definable in the
// dependency injection?

({ props. theme, __ }) => {
	// This registers a listener for props.x, making sure it only
	// re-renders when props.x is changed
	return <div>{props.x}</div>
}

```

### Steps:

[ ] Create basic render function
[ ] Something similar to useEffect
[ ] Make basic VDOM renderer work
[ ] Make the renderer modular/hookable
[ ] Make VDOM renderer do diffing
[ ] Transform old mixins to modules
[ ] modules.Hierarchy manager
[ ] modules.Template manager
[ ] modules.Event listeners
[ ] modules.I18n
[ ] modules.Props
[ ] modules.Theme
[ ] Typed CSS
[ ] Make modules render differently based on what is accessed (auto mode)
[ ] Static analysis
