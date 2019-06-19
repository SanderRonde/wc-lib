import { mixin, ConfigurableMixin, config, ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, ExtendableMixin } from "../../../../../../src/wclib.js";
import { Constructor } from "../../../../../../src/classes/types.js";

export interface TestMixinsWindow extends Window {
	mixins: {
		UnConfiguredMixin: typeof UnConfiguredMixin;
		UnextendedMixin: typeof UnextendedMixin;
	}
}
declare const window: TestMixinsWindow;

type MixinReturn<F> = F extends (...args: any[]) => infer R ? R : void;
const MixinA = (superFn: typeof ConfigurableWebComponent & {
	new(...args: any[]): ConfigurableWebComponent;
}) => class MixinA extends superFn {
	a = 1;

	static c = 3;
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
const MixinZ = <S extends Constructor<{}>>(superFn: S) => class MixinZ extends superFn {
	z = 1;
}

@config({
	is: 'basic-mixin',
	html: null
})
export class BasicMixin extends mixin(ConfigurableMixin) {
	z = 1
}

const splitMixin = 
	mixin(
		() => mixin(ConfigurableMixin, MixinA),
		MixinB as any,
		(superClass: any) => mixin(() => superClass, MixinC, MixinD),
		MixinE as any
	) as unknown as typeof ConfigurableWebComponent;


@config({
	is: 'single-mixin',
	html: null
})
export class SingleMixin extends mixin(ConfigurableMixin, MixinA) {
	z = 1
}

export class UnConfiguredMixin extends mixin(ConfigurableMixin, MixinA) {
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

export class UnextendedMixin extends mixin(ExtendableMixin, MixinZ) {
	t = 1;
}

export class ManualMixin extends mixin(ExtendableMixin, MixinZ) {
	static is = 'manual-mixin';
	static html = new TemplateFn<ManualMixin>(null, CHANGE_TYPE.NEVER, null);
	static css = new TemplateFn<ManualMixin>(null, CHANGE_TYPE.NEVER, null);
	static dependencies = [];
	static mixins = [];

	get self() {
		return ManualMixin;
	}

	t = 1;
}

window.mixins = {
	UnConfiguredMixin,
	UnextendedMixin
}