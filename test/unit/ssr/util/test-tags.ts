import { SSR } from '../../../../build/cjs/wc-lib-ssr.all.js';
import { ExecutionContext } from 'ava';

class TestTag extends Array<TestTag> {
    constructor(
        protected _t: ExecutionContext<unknown>,
        public parsedTag: ParsedTag,
        public children: TestTag[] = []
    ) {
        super(...TestTag._nonEmptyChildren(children));
        this.children = TestTag._nonEmptyChildren(children);
    }

    private static _nonEmptyChildren(children: TestTag[]) {
        return children.filter((c) => c.isTag() || !c.isEmpty());
    }

    get tag() {
        this.assertTag();
        return this.parsedTag as SSR._Rendering.TextToTags.Tag;
    }

    get textTag() {
        this.assertText();
        return this.parsedTag as SSR._Rendering.TextToTags.TextTag;
    }

    get c() {
        this.assertTag();
        return this.children;
    }

    get tc() {
        this.assertTag();
        return this.children.filter((c) => c.isTag());
    }

    get content() {
        this.assertText();
        return this.textTag.content;
    }

    isTag() {
        return this.parsedTag.type === 'TAG';
    }

    isText() {
        return this.parsedTag.type === 'TEXT';
    }

    isEmpty() {
        return this.content.trim() === '';
    }

    assertTag() {
        this._t.is(this.parsedTag.type, 'TAG', 'Type is tag');
    }

    assertText() {
        this._t.is(this.parsedTag.type, 'TEXT', 'Type is text');
    }

    assertContent(content: string) {
        this._t.is(this.content.trim(), content, `Text content is ${content}`);
    }

    assertType(type: 'TEXT' | 'TAG') {
        this._t.is(this.parsedTag.type, type, `Type is ${type}`);
    }

    assertTagName(tagName: string) {
        this._t.is(this.tag.tagName, tagName, 'Tagnames match');
    }

    assertChildren(amount?: number) {
        this.assertTag();

        if (amount === void 0 || amount > 0) {
            this._t.true(this.children.length > 0, 'Has children');
            if (amount === void 0) return;
        }
        if (amount !== void 0) {
            this._t.is(
                this.children.length,
                amount,
                `Amount of children is ${amount}`
            );
        }
    }

    assertMinChildren(amount: number) {
        this.assertTag();

        if (amount > 0) {
            this._t.true(this.children.length > 0, 'Has children');
        }
        this._t.true(
            this.children.length >= amount,
            `Amount of children is at least ${amount}`
        );
    }

    assertHasAttribute(name: string) {
        this._t.true(
            name in this.tag.attributes,
            'Attribute is in attributes object'
        );
    }

    assertDoesNotHaveAttribute(name: string) {
        this._t.false(
            name in this.tag.attributes,
            'Attribute is not in attributes object'
        );
    }

    private _escapeAttributeValue(value: string) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    assertAttribute(name: string, value: string) {
        this.assertHasAttribute(name);
        this._t.is(
            this.tag.attributes[name],
            this._escapeAttributeValue(value),
            'Expected attributes match'
        );
    }

    assertHasClass(className: string) {
        this.assertHasAttribute('class');
        const classString = this.tag.attributes['class'] as string;
        const classes = classString.split(' ');

        this._t.true(classes.includes(className), 'Class is in class list');
    }

    assertHasClasses(...classNames: string[]) {
        for (const className of classNames) {
            this.assertHasClass(className);
        }
    }

    assertDoesNotHaveClass(className: string) {
        if (!('class' in this.tag.attributes)) return;
        const classString = this.tag.attributes['class'] as string;
        const classes = classString.split(' ');

        this._t.false(
            classes.includes(className),
            'Class is not in class list'
        );
    }

    assertDoesNotHaveClasses(...classNames: string[]) {
        for (const className of classNames) {
            this.assertDoesNotHaveClass(className);
        }
    }

    assertClassString(str: string) {
        this.assertHasClasses(...str.split(' '));
    }

    private _assertExactAttributes(attributes: { [key: string]: string }) {
        const mappedAttributes = {};
        for (const key in attributes) {
            (mappedAttributes as any)[key] = this._escapeAttributeValue(
                attributes[key]
            );
        }

        this._t.deepEqual(
            this.tag.attributes,
            mappedAttributes,
            'Attributes are equal'
        );
    }

    private _assertHasAttributes(attributes: { [key: string]: string }) {
        for (const key in attributes) {
            this.assertAttribute(key, attributes[key]);
        }
    }

    assertAttributes(
        attributes: {
            [key: string]: string;
        },
        exact: boolean = true
    ) {
        if (exact) {
            this._assertExactAttributes(attributes);
        } else {
            this._assertHasAttributes(attributes);
        }
    }

    assertAutoClosing(isAutoClosing: boolean = true) {
        this._t.is(
            this.tag.isSelfClosing,
            isAutoClosing,
            'Autoclosing values match'
        );
    }

    assertFormat(format: TestTagFormat | string) {
        if (typeof format === 'string') {
            this.assertText();
            this.assertContent(format);
        } else {
            const [name, children] = format;

            this.assertTag();
            this.assertTagName(name);
            this.assertChildren(children.length);

            this.forEach((child, index) => {
                child.assertFormat(children[index]);
            });
        }
    }
}

type TestTagFormat = [string, TestTagsFormat[]];
type TestTagsFormat = TestTagFormat | string;

type ParsedTag = SSR._Rendering.TextToTags.ParsedTag;

function mapTag<R>(
    tag: ParsedTag,
    handler: (tag: ParsedTag, children: R[]) => R
): R {
    if (tag.type === 'TEXT') return handler(tag, []);

    const children = tag.children.map((c) => mapTag(c, handler));
    return handler(tag, children);
}

export function toTestTags(t: ExecutionContext<unknown>, text: string) {
    const tags = SSR._Rendering.TextToTags._Parser.parse(text);
    return tags.map((tag) => {
        return mapTag<TestTag>(tag, (tag, children) => {
            return new TestTag(t, tag, children);
        });
    })[0];
}
