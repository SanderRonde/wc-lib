# Simple Clock

This is a simple clock that serves as an example of how to use properties.

## How it works

The properties of the `SimpleClock` component are defined by `props = Props.define(this, {})`. It takes an object with two optional keys: "reflect" and "priv". They both take an object that defines the actual properties on it. Properties defined under "reflect" will be reflected back to the component's props (think of an HTML input element's `value` property), while properties under "priv" are not.

The objects these values take are key-value pairs where the key is the name of the property and the value is either a property type (defined by `PROP_TYPE.xxx` or `ComplexType<TYPE>()` for less generic types such as objects) or a config object containing a `type` property that contains a property type. A list of the keys/values of the config object can be found below. 

In this case the `seconds` property is defined to be a number with initial value 0. It is then incremented every second. Since the template is set to `CHANGE_TYPE.PROP` it will re-render whenever a property changes. Since the `seconds` property changes every second, the template is re-rendered along with it, updating the time.

The `mounted()` function is called when the component is mounted to the DOM and should serve as a starting point for the component's logic. Doing any work in the constructor is not recommended since at this point you're working on an unmounted element (with no content), in addition to this slowing down initial rendering of a page.

## Props config

```ts
{
	// Watch this property for changes. Only relevant if the type
	// of this value is an object/array. Setting this to true
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
}
```