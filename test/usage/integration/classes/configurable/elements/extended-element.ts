import {
    TemplateFn,
    CHANGE_TYPE,
    MixinFn,
    WebComponent,
    TemplateFnLike,
} from '../../../../../../build/es/wc-lib.js';
import { WebComponentDefinerMixinClass } from '../../../../../../build/es/classes/types.js';

export interface TestExtendedWindow extends Window {
    extended: {
        HTMLTemplate: TemplateFn;
        CSSTemplate: TemplateFn;
        element: typeof ExtendedElement;
        dependencies: Pick<WebComponentDefinerMixinClass, 'define'>[];
        mixins: MixinFn<any, any, any>[];

        wrongClasses: {
            MissingIs: typeof MissingIs;
            NonStringIs: typeof NonStringIs;
            NoDashIs: typeof NoDashIs;
            UppercaseIs: typeof UppercaseIs;
            NumberIs: typeof NumberIs;
            DashIs: typeof DashIs;
            MissingHTML: typeof MissingHTML;
            UnsetHTML: typeof UnsetHTML;
            UnsetHTML2: typeof UnsetHTML2;
            NonTemplateHTML: typeof NonTemplateHTML;
            FalsyTemplateHTML: typeof FalsyTemplateHTML;
            TemplateLikeHTML: typeof TemplateLikeHTML;
            MissingCSS: typeof MissingCSS;
            NonTemplateCSS: typeof NonTemplateCSS;
            WrongArrayCSS: typeof WrongArrayCSS;
            FalsyArrayCSS: typeof FalsyArrayCSS;
            ArrayCSS: typeof ArrayCSS;
            MissingSelf: typeof MissingSelf;
        };
    };
}
declare const window: TestExtendedWindow;

const HTMLTemplate = new TemplateFn<ExtendedElement>(
    null,
    CHANGE_TYPE.NEVER,
    () => {}
);
const CSSTemplate = new TemplateFn<ExtendedElement>(
    null,
    CHANGE_TYPE.NEVER,
    () => {}
);
const dependencies = [] as Pick<WebComponentDefinerMixinClass, 'define'>[];
const mixins = [] as MixinFn<any, any, any>[];

export class ExtendedElement extends WebComponent {
    static is = 'extended-element';
    static html = HTMLTemplate;
    static css = CSSTemplate;
    static dependencies = dependencies;
    static mixins = mixins;

    get self() {
        return ExtendedElement;
    }
}

class MissingIs extends WebComponent {
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return MissingIs;
    }
}

class NonStringIs extends WebComponent {
    static is = 1 as any;
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return NonStringIs;
    }
}

class NoDashIs extends WebComponent {
    static is = 'invalid';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return NoDashIs;
    }
}

class UppercaseIs extends WebComponent {
    static is = 'Uppercase-Name';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return UppercaseIs;
    }
}

class NumberIs extends WebComponent {
    static is = '0number-name';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return NumberIs;
    }
}

class DashIs extends WebComponent {
    static is = '-dashname';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return DashIs;
    }
}

class MissingHTML extends WebComponent {
    static is = 'missing-html';
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return MissingHTML;
    }
}

class UnsetHTML extends WebComponent {
    static is = 'unset-html';
    static html = null;
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return UnsetHTML;
    }
}

class UnsetHTML2 extends WebComponent {
    static is = 'unset-html2';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return UnsetHTML2;
    }
}

class NonTemplateHTML extends WebComponent {
    static is = 'non-template-html';
    static html = 3 as any;
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return NonTemplateHTML;
    }
}

class FalsyTemplateHTML extends WebComponent {
    static is = 'falsy-template-html';
    static html = false as any;
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return FalsyTemplateHTML;
    }
}

class TemplateLike implements TemplateFnLike {
    constructor(public changeOn: number) {}

    renderAsText(
        _changeType: CHANGE_TYPE,
        _component: {
            props: any;
        }
    ): string {
        return '';
    }
    renderTemplate(
        _changeType: CHANGE_TYPE,
        _component: {
            props: any;
        }
    ): any | null {
        return '';
    }
    renderSame(
        _changeType: CHANGE_TYPE,
        _component: {
            props: any;
        },
        _templater: any
    ): any | string | null {
        return '';
    }
    render(_template: any | null, _target: HTMLElement): void {}
    renderIfNew(_template: any | null, _target: HTMLElement): void {}
}

class TemplateLikeHTML extends WebComponent {
    static is = 'template-extender';
    static html = new TemplateLike(1);
    static css = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return UnsetHTML2;
    }
}

class MissingCSS extends WebComponent {
    static is = 'missing-css';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static dependencies = [];
    static mixins = [];

    get self() {
        return MissingCSS;
    }
}

class NonTemplateCSS extends WebComponent {
    static is = 'non-template-css';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = 3 as any;
    static dependencies = [];
    static mixins = [];

    get self() {
        return NonTemplateCSS;
    }
}

class WrongArrayCSS extends WebComponent {
    static is = 'wrong-array-css';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = [1, 2, 3] as any;
    static dependencies = [];
    static mixins = [];

    get self() {
        return WrongArrayCSS;
    }
}

class FalsyArrayCSS extends WebComponent {
    static is = 'falsy-array-css';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = [false, false, false] as any;
    static dependencies = [];
    static mixins = [];

    get self() {
        return FalsyArrayCSS;
    }
}

class ArrayCSS extends WebComponent {
    static is = 'array-css';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = [
        new TemplateFn<WebComponent>(null, CHANGE_TYPE.NEVER, () => {}),
        new TemplateFn<WebComponent>(null, CHANGE_TYPE.NEVER, () => {}),
        new TemplateFn<WebComponent>(null, CHANGE_TYPE.NEVER, () => {}),
    ];
    static dependencies = [];
    static mixins = [];

    get self() {
        return ArrayCSS;
    }
}

//@ts-ignore
class MissingSelf extends WebComponent {
    static is = 'missing-self';
    static html = new TemplateFn<ExtendedElement>(
        null,
        CHANGE_TYPE.NEVER,
        () => {}
    );
    static css = [
        new TemplateFn<WebComponent>(null, CHANGE_TYPE.NEVER, () => {}),
        new TemplateFn<WebComponent>(null, CHANGE_TYPE.NEVER, () => {}),
        new TemplateFn<WebComponent>(null, CHANGE_TYPE.NEVER, () => {}),
    ];
    static dependencies = [];
    static mixins = [];

    static onConnected(_superFn: () => void) {
        // Will be stubbed
    }

    connectedCallback() {
        MissingSelf.onConnected(super.connectedCallback.bind(this));
    }
}

window.extended = {
    HTMLTemplate,
    CSSTemplate,
    element: ExtendedElement,
    dependencies,
    mixins,

    wrongClasses: {
        MissingIs,
        NonStringIs,
        NoDashIs,
        UppercaseIs,
        NumberIs,
        DashIs,
        MissingHTML,
        UnsetHTML,
        UnsetHTML2,
        NonTemplateHTML,
        FalsyTemplateHTML,
        TemplateLikeHTML,
        MissingCSS,
        NonTemplateCSS,
        WrongArrayCSS,
        FalsyArrayCSS,
        ArrayCSS,
        MissingSelf,
    },
};

MissingSelf.define(true);
