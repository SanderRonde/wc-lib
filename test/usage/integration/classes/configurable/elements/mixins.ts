import { mixin, ConfigurableMixin, config, ConfigurableWebComponent } from "../../../../../../src/wclib.js";

@config({
	is: 'basic-mixin',
	html: null
})
export class BasicMixin extends mixin(ConfigurableMixin) {
	z = 1
}

type MixinReturn<F> = F extends (...args: any[]) => infer R ? R : void;
const MixinA = (superFn: typeof ConfigurableWebComponent) => class MixinA extends superFn {
	a = 1;
}
const MixinB = (superFn: MixinReturn<typeof MixinA>) => class MixinB extends superFn {
	b = 1;
}
const MixinC = (superFn: MixinReturn<typeof MixinB>) => class MixinC extends superFn {
	c = 1;
}
const MixinD = (superFn: MixinReturn<typeof MixinC>) => class MixinD extends superFn {
	d = 1;
}
const MixinE = (superFn: MixinReturn<typeof MixinD>) => class MixinE extends superFn {
	e = 1;
}

const splitMixin = 
	mixin(
		() => mixin(ConfigurableMixin, MixinA),
		MixinB,
		(superClass) => mixin(() => superClass, MixinC, MixinD),
		MixinE
	)


@config({
	is: 'single-mixin',
	html: null
})
export class SingleMixin extends mixin(ConfigurableMixin, MixinA) {
	z = 1
}

@config({
	is: 'double-mixin',
	html: null
})
export class DoubleMixin extends mixin(ConfigurableMixin, MixinA, MixinB) {
	z = 1
}

@config({
	is: 'multi-mixin',
	html: null
})
export class MultiMixin extends mixin(ConfigurableMixin, MixinA, MixinB, MixinC, MixinD, MixinE) {
	z = 1
}

@config({
	is: 'split-mixin',
	html: null
})
export class SplitMixin extends splitMixin {
	z = 1
}