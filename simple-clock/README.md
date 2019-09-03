# Simple Clock

This is a simple clock that serves as an example of how to use properties.

## How it works

The properties of the `SimpleClock` component are defined by `props = Props.define(this, {})`. It takes an object with two optional keys: "reflect" and "priv". They both take an object that defines the actual properties on it. Properties defined under "reflect" will be reflected back to the component's props (think of an HTML input element's `value` property), while properties under "priv" are not.

The objects these values take are key-value pairs where the key is the name of the property and the value is either a property type (defined by `PROP_TYPE.xxx` or `ComplexType<TYPE>()` for less generic types such as objects) or a config object containing a `type` property that contains a property type. A list of the keys/values of the config object can be found below. 

In this case the `seconds` property is defined to be a number with initial value 0. It is then incremented every second. Since the template is set to `CHANGE_TYPE.PROP` it will re-render whenever a property changes. Since the `seconds` property changes every second, the template is re-rendered along with it, updating the time.

The `mounted()` function is called when the component is mounted to the DOM and should serve as a starting point for the component's logic. Doing any work in the constructor is not recommended since at this point you're working on an unmounted element (with no content), in addition to this slowing down initial rendering of a page.

## Props config

See the `README.md` file at the root of the project for details.