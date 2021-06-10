var window = typeof window === "undefined" ? {} : window;
// modules/wc-lib/lib/enums.js
var CHANGE_TYPE;
(function(CHANGE_TYPE3) {
  CHANGE_TYPE3[CHANGE_TYPE3["NEVER"] = 0] = "NEVER";
  CHANGE_TYPE3[CHANGE_TYPE3["MANUAL"] = 0] = "MANUAL";
  CHANGE_TYPE3[CHANGE_TYPE3["PROP"] = 1] = "PROP";
  CHANGE_TYPE3[CHANGE_TYPE3["THEME"] = 2] = "THEME";
  CHANGE_TYPE3[CHANGE_TYPE3["LANG"] = 4] = "LANG";
  CHANGE_TYPE3[CHANGE_TYPE3["SUBTREE_PROPS"] = 8] = "SUBTREE_PROPS";
  CHANGE_TYPE3[CHANGE_TYPE3["GLOBAL_PROPS"] = 16] = "GLOBAL_PROPS";
  CHANGE_TYPE3[CHANGE_TYPE3["ALWAYS"] = 63] = "ALWAYS";
  CHANGE_TYPE3[CHANGE_TYPE3["FORCE"] = 127] = "FORCE";
})(CHANGE_TYPE || (CHANGE_TYPE = {}));
var PROP_TYPE;
(function(PROP_TYPE3) {
  PROP_TYPE3["STRING"] = "string";
  PROP_TYPE3["NUMBER"] = "number";
  PROP_TYPE3["BOOL"] = "bool";
  PROP_TYPE3["STRING_REQUIRED"] = "string_required";
  PROP_TYPE3["NUMBER_REQUIRED"] = "number_required";
  PROP_TYPE3["BOOL_REQUIRED"] = "bool_required";
  PROP_TYPE3["STRING_OPTIONAL"] = "string_optional";
  PROP_TYPE3["NUMBER_OPTIONAL"] = "number_optional";
  PROP_TYPE3["BOOL_OPTIONAL"] = "bool_optional";
})(PROP_TYPE || (PROP_TYPE = {}));

// modules/wc-lib/lib/base.js
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CUSTOM_CSS_PROP_NAME = "custom-css";
function repeat(size) {
  return new Array(size).fill(0);
}
function makeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}
function bindToClass(_target, propertyKey, descriptor) {
  if (!descriptor || typeof descriptor.value !== "function") {
    throw new TypeError(`Only methods can be decorated with @bind. <${propertyKey}> is not a method!`);
  }
  return {
    configurable: true,
    get() {
      const bound = descriptor.value.bind(this);
      Object.defineProperty(this, propertyKey, {
        value: bound,
        configurable: true,
        writable: true
      });
      return bound;
    }
  };
}
function assignAsGetter(objectA, objectB, writable = false) {
  const returnObj = {};
  const bKeys = Object.keys(objectB);
  const aKeys = Object.keys(objectA).filter((k) => !bKeys.includes(k));
  for (const aKey of aKeys) {
    Object.defineProperty(returnObj, aKey, Object.assign({
      get() {
        return objectA[aKey];
      },
      enumerable: true
    }, writable ? {
      set(value) {
        objectA[aKey] = value;
      }
    } : {}));
  }
  for (const bKey of bKeys) {
    Object.defineProperty(returnObj, bKey, Object.assign({
      get() {
        return objectB[bKey];
      },
      enumerable: true
    }, writable ? {
      set(value) {
        objectB[bKey] = value;
      }
    } : {}));
  }
  return returnObj;
}
var BaseClassElementInstance = class {
  constructor() {
    this.___cssArr = null;
    this.___privateCSS = null;
    this.__cssSheets = null;
  }
};
var baseClassInstances = new Map();
var BaseClass = class {
  constructor(_self) {
    this._self = _self;
    this.disableRender = false;
    this.__firstRender = true;
    this.___renderContainers = null;
    this.__sheetsMounted = false;
    this.___canUseConstructedCSS = null;
  }
  get instance() {
    if (baseClassInstances.has(this._self.self.is)) {
      return baseClassInstances.get(this._self.self.is);
    }
    const classInstance = new BaseClassElementInstance();
    baseClassInstances.set(this._self.self.is, classInstance);
    return classInstance;
  }
  get __cssArr() {
    const instance = this.instance;
    if (instance.___cssArr !== null)
      return instance.___cssArr;
    return instance.___cssArr = makeArray(this._self.self.css || []);
  }
  get __privateCSS() {
    const instance = this.instance;
    if (instance.___privateCSS !== null)
      return instance.___privateCSS;
    return instance.___privateCSS = this.canUseConstructedCSS ? this.__cssArr.filter((template) => {
      return !(template.changeOn === CHANGE_TYPE.THEME || template.changeOn === CHANGE_TYPE.NEVER);
    }) : this.__cssArr;
  }
  doPreRenderLifecycle() {
    this.disableRender = true;
    const retVal = this._self.preRender();
    this.disableRender = false;
    return retVal;
  }
  doPostRenderLifecycle() {
    this._self.___definerClass.internals.postRenderHooks.forEach((fn) => fn());
    if (this.__firstRender) {
      this.__firstRender = false;
      this._self.firstRender();
    }
    this._self.postRender();
  }
  __createFixtures() {
    const css = (() => {
      return this.__cssArr.map(() => {
        const el = document.createElement("span");
        el.setAttribute("data-type", "css");
        return el;
      });
    })();
    const customCSS = (() => {
      if (this._self.__hasCustomCSS()) {
        return repeat(makeArray(this._self.customCSS()).length).map(() => {
          const el = document.createElement("span");
          el.setAttribute("data-type", "custom-css");
          return el;
        });
      } else {
        return [];
      }
    })();
    const html3 = document.createElement("span");
    html3.setAttribute("data-type", "html");
    css.forEach((n) => this._self.root.appendChild(n));
    customCSS.forEach((n) => this._self.root.appendChild(n));
    this._self.root.appendChild(html3);
    return {
      css,
      customCSS,
      html: html3
    };
  }
  get renderContainers() {
    if (this.___renderContainers) {
      return this.___renderContainers;
    }
    return this.___renderContainers = this.__createFixtures();
  }
  __genConstructedCSS() {
    this.instance.__cssSheets = this.instance.__cssSheets || this.__cssArr.filter((template) => {
      return template.changeOn === CHANGE_TYPE.THEME || template.changeOn === CHANGE_TYPE.NEVER;
    }).map((t) => ({
      sheet: new CSSStyleSheet(),
      template: t
    }));
  }
  renderConstructedCSS(change) {
    if (!this.__cssArr.length)
      return;
    if (!this.__sheetsMounted) {
      this.__genConstructedCSS();
      if (this.instance.__cssSheets.length) {
        this._self.root.adoptedStyleSheets = this.instance.__cssSheets.map((s) => s.sheet);
        this.__sheetsMounted = true;
        change = CHANGE_TYPE.ALWAYS;
      }
    }
    if (!(change & CHANGE_TYPE.THEME)) {
      return;
    }
    if (!this._self.self.__constructedCSSChanged(this._self)) {
      return;
    }
    this.instance.__cssSheets.forEach(({sheet, template}) => {
      const rendered = template.renderAsText(change, this._self).replace(/<\/?style>/g, "");
      sheet.replaceSync(rendered);
    });
  }
  get canUseConstructedCSS() {
    if (this.___canUseConstructedCSS !== null) {
      return this.___canUseConstructedCSS;
    }
    return this.___canUseConstructedCSS = (() => {
      try {
        new CSSStyleSheet();
        return true;
      } catch (e) {
        return false;
      }
    })();
  }
  getRenderFn(template, change) {
    if (change === CHANGE_TYPE.FORCE) {
      return template.render.bind(template);
    } else {
      return template.renderIfNew.bind(template);
    }
  }
};
BaseClass.__constructedCSSRendered = false;
var WebComponentBaseMixin = (superFn) => {
  const privateMap = new WeakMap();
  function baseClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new BaseClass(self)).get(self);
  }
  class WebComponentBase extends superFn {
    constructor() {
      super(...arguments);
      this.root = this.attachShadow({
        mode: "open"
      });
      this.props = {};
    }
    get self() {
      return null;
    }
    __hasCustomCSS() {
      return false;
    }
    customCSS() {
      return [];
    }
    static __constructedCSSChanged(_element) {
      if (BaseClass.__constructedCSSRendered) {
        return false;
      }
      BaseClass.__constructedCSSRendered = true;
      return true;
    }
    get jsxProps() {
      return this.props;
    }
    renderToDOM(change = CHANGE_TYPE.FORCE) {
      const priv = baseClass(this);
      if (priv.disableRender)
        return;
      if (priv.doPreRenderLifecycle() === false) {
        return;
      }
      if (priv.canUseConstructedCSS) {
        priv.renderConstructedCSS(change);
      }
      priv.__privateCSS.forEach((sheet, index) => {
        priv.getRenderFn(sheet, change)(sheet.renderTemplate(change, this), priv.renderContainers.css[index]);
      });
      if (this.__hasCustomCSS()) {
        makeArray(this.customCSS()).forEach((sheet, index) => {
          priv.getRenderFn(sheet, change)(sheet.renderTemplate(change, this), priv.renderContainers.customCSS[index]);
        });
      }
      if (this.self.html) {
        priv.getRenderFn(this.self.html, change)(this.self.html.renderTemplate(change, this), priv.renderContainers.html);
      }
      priv.doPostRenderLifecycle();
    }
    getRenderArgs(changeType) {
      const _this = this;
      return {
        get props() {
          return _this.props;
        },
        changeType
      };
    }
    preRender() {
    }
    postRender() {
    }
    firstRender() {
    }
    connectedCallback() {
    }
  }
  __decorate([
    bindToClass
  ], WebComponentBase.prototype, "renderToDOM", null);
  const __typecheck__ = WebComponentBase;
  __typecheck__;
  return WebComponentBase;
};

// modules/wc-lib/lib/shared.js
function classNames(...args) {
  var classes = [];
  for (const arg of args) {
    if (!arg && typeof arg !== "number")
      continue;
    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(arg);
    } else if (Array.isArray(arg) && arg.length) {
      var inner = classNames.apply(null, arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (typeof arg === "object") {
      const objArg = arg;
      for (var key in objArg) {
        if (objArg[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(" ");
}
var WCLibError = class extends Error {
  constructor(component, message) {
    super(`${message} (see error.component)`);
    this.component = component;
  }
};

// modules/wc-lib/lib/template-manager.js
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClassAttributePart = class {
  constructor(element, name, strings, _config) {
    this.element = element;
    this.name = name;
    this.strings = strings;
    this._config = _config;
    this.value = void 0;
    this._pendingValue = void 0;
  }
  _isPrimitive(value) {
    return value === null || !(typeof value === "object" || typeof value === "function");
  }
  setValue(value) {
    if (value !== this._config.noChange && (!this._isPrimitive(value) || value !== this.value)) {
      this._pendingValue = value;
    }
  }
  _getClassNameString(args) {
    if (Array.isArray(args)) {
      return classNames(...args);
    } else {
      return classNames(args);
    }
  }
  commit() {
    while (this._config.isDirective(this._pendingValue)) {
      const directive2 = this._pendingValue;
      this._pendingValue = this._config.noChange;
      directive2(this);
    }
    if (this._pendingValue === this._config.noChange) {
      return;
    }
    if (typeof this._pendingValue === "string" || typeof this._pendingValue === "number") {
      this.value = this._pendingValue + "";
      this.element.setAttribute(this.name, this._pendingValue + "");
    } else {
      const classString = this._getClassNameString(this._pendingValue);
      this.element.setAttribute(this.name, classString);
    }
    this._pendingValue = this._config.noChange;
  }
};
var StyleAttributePart = class {
  constructor(element, name, strings, _config) {
    this.element = element;
    this.name = name;
    this.strings = strings;
    this._config = _config;
    this.value = void 0;
    this._pendingValue = void 0;
  }
  _isPrimitive(value) {
    return value === null || !(typeof value === "object" || typeof value === "function");
  }
  setValue(value) {
    if (value !== this._config.noChange && (!this._isPrimitive(value) || value !== this.value)) {
      this._pendingValue = value;
    }
  }
  static _toDashes(camelCase) {
    return camelCase.replace(/([a-z\d])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1-$2").toLowerCase();
  }
  static getStyleString(args) {
    const arr = [];
    for (const key in args) {
      arr.push(`${this._toDashes(key)}: ${args[key]};`);
    }
    return arr.join(" ");
  }
  commit() {
    while (this._config.isDirective(this._pendingValue)) {
      const directive2 = this._pendingValue;
      this._pendingValue = this._config.noChange;
      directive2(this);
    }
    if (this._pendingValue === this._config.noChange) {
      return;
    }
    if (typeof this._pendingValue === "string" || typeof this._pendingValue === "number") {
      this.value = this._pendingValue + "";
      this.element.setAttribute(this.name, this._pendingValue + "");
    } else {
      const styleString = StyleAttributePart.getStyleString(this._pendingValue);
      this.element.setAttribute(this.name, styleString);
    }
    this._pendingValue = this._config.noChange;
  }
};
var ComplexValuePart = class {
  constructor(element, name, strings, genRef, _config) {
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.genRef = genRef;
    this._config = _config;
    this.value = void 0;
    this._pendingValue = void 0;
  }
  setValue(value) {
    if (value !== this._config.noChange && value !== this.value) {
      this._pendingValue = value;
    }
  }
  static __isTemplate(value) {
    if (!value)
      return false;
    if (typeof value.changeOn !== "number" || typeof value.renderAsText !== "function" || typeof value.renderTemplate !== "function" || typeof value.renderSame !== "function" || typeof value.render !== "function" || typeof value.renderIfNew !== "function") {
      return false;
    }
    return true;
  }
  commit() {
    while (this._config.isDirective(this._pendingValue)) {
      const directive2 = this._pendingValue;
      this._pendingValue = this._config.noChange;
      directive2(this);
    }
    if (this._pendingValue === this._config.noChange) {
      return;
    }
    if (this.name === CUSTOM_CSS_PROP_NAME && !ComplexValuePart.__isTemplate(this._pendingValue)) {
      console.warn("Attempting to use non TemplateFn value for custom-css property");
      this._pendingValue = new TemplateFn(null, CHANGE_TYPE.NEVER, null);
    }
    let err = false;
    if (typeof this._pendingValue !== "string") {
      err = true;
    } else {
      try {
        JSON.parse(this._pendingValue);
        this.element.setAttribute(this.name, this._pendingValue);
      } catch (e) {
        err = true;
      }
    }
    if (err) {
      this.element.setAttribute(this.name, this.genRef(this._pendingValue));
    }
    this.value = this._pendingValue;
    this._pendingValue = this._config.noChange;
  }
};
function getComponentEventPart(eventPart, config3) {
  return class ComponentEventPart extends eventPart {
    constructor(element, eventName, eventContext) {
      super(element, eventName, eventContext);
      this._pendingValue = void 0;
      this.element = element;
      this.eventName = eventName;
      this.eventContext = eventContext;
    }
    setValue(value) {
      this._pendingValue = value;
    }
    commit() {
      while (config3.isDirective(this._pendingValue)) {
        const directive2 = this._pendingValue;
        this._pendingValue = config3.noChange;
        directive2(this);
      }
      if (this._pendingValue === config3.noChange) {
        return;
      }
      const newListener = this._pendingValue;
      const oldListener = this.value;
      const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
      const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
      if (!("listen" in this.element) || !("clearListener" in this.element)) {
        console.warn("Attempting to listen using webcomponent listener on non-webcomponent element", `Name: ${this.eventName}, element:`, this.element);
      }
      if (shouldRemoveListener && "clearListener" in this.element && this.element.clearListener) {
        this.element.clearListener(this.eventName);
      }
      if (shouldAddListener && "listen" in this.element && this.element.listen) {
        this.element.listen(this.eventName, this.handleEvent.bind(this));
      }
      this.value = newListener;
      this._pendingValue = config3.noChange;
    }
    handleEvent(...args) {
      if (typeof this.value === "function") {
        return this.value.call(this.eventContext, ...args);
      } else {
        return this.value.handleEvent(...args);
      }
    }
  };
}
var ComplexTemplateProcessor = class {
  constructor(component, genRef, _config) {
    this.component = component;
    this.genRef = genRef;
    this._config = _config;
    this.__componentEventPart = null;
  }
  get _componentEventPart() {
    if (this.__componentEventPart !== null) {
      return this.__componentEventPart;
    }
    return this.__componentEventPart = getComponentEventPart(this._config.EventPart, this._config);
  }
  _isComplexAttribute(element, name) {
    const propsComponent = element;
    if (!("props" in propsComponent) || !propsComponent.props)
      return false;
    const props = propsComponent.props;
    if (!props.__config)
      return false;
    const propsConfig = props.__config;
    const joined = Object.assign(Object.assign({}, propsConfig.reflect), propsConfig.priv);
    const propConfig = (() => {
      if (name in joined) {
        return getDefinePropConfig(joined[name]);
      }
      const casingName = dashesToCasing(name);
      if (casingName in joined) {
        return getDefinePropConfig(joined[casingName]);
      }
      return null;
    })();
    if (propConfig === null)
      return false;
    return propConfig.type instanceof ComplexTypeClass;
  }
  handleAttributeExpressions(element, name, strings) {
    const prefix = name[0];
    if (prefix === "@" || name.startsWith("on-")) {
      if (name[1] === "@" || name.startsWith("on--")) {
        return [
          new this._componentEventPart(element, name[1] === "@" ? name.slice(2) : name.slice("on--".length), this.component)
        ];
      } else {
        return [
          new this._config.EventPart(element, prefix === "@" ? name.slice(1) : name.slice("on-".length), this.component)
        ];
      }
    } else if (prefix === ".") {
      return new this._config.PropertyCommitter(element, name.slice(1), strings).parts;
    } else if (prefix === "?") {
      return [
        new this._config.BooleanAttributePart(element, name.slice(1), strings)
      ];
    } else if (name === "class") {
      return [
        new ClassAttributePart(element, name, strings, this._config)
      ];
    } else if (name === "style") {
      return [
        new StyleAttributePart(element, name, strings, this._config)
      ];
    } else if (prefix === "#" || name === CUSTOM_CSS_PROP_NAME || this._isComplexAttribute(element, name)) {
      if (prefix === "#") {
        name = name.slice(1);
      }
      return [
        new ComplexValuePart(element, name, strings, this.genRef, this._config)
      ];
    }
    const committer = new this._config.AttributeCommitter(element, name, strings);
    return committer.parts;
  }
  handleTextExpression(options) {
    return new this._config.NodePart(options);
  }
};
var TemplateClass = class {
  constructor(_self) {
    this._self = _self;
    this.reffed = [];
    this._templateProcessor = null;
  }
  get templateProcessor() {
    if (this._templateProcessor !== null) {
      return this._templateProcessor;
    }
    return this._templateProcessor = new ComplexTemplateProcessor(this._self, this.genRef, TemplateClass._templateSettings);
  }
  static get templateResult() {
    if (!this._templateSettings) {
      console.warn("Missing templater, please initialize it by calling WebComponentTemplateManager.initComplexTemplateProvider({	TemplateResult: {{lit-html.TemplateResult}}	PropertyCommitter: {{lit-html.PropertyCommitter}}	EventPart: {{lit-html.EventPart}}	BooleanAttributePart: {{lit-html.BooleanAttributePart}}	AttributeCommitter: {{lit-html.AttributeCommitter}}	NodePart: {{lit-html.TemplateResult}}	isDirective: {{lit-html.isDirective}}	noChange: {{lit-html.noChange}}	directive: {{lit-html.directive}}})");
      return class X {
      };
    }
    return this._templateSettings.TemplateResult;
  }
  genRef(value) {
    if (this.reffed.indexOf(value) !== -1) {
      return `${refPrefix}${this.reffed.indexOf(value)}`;
    }
    this.reffed.push(value);
    const refIndex = this.reffed.length - 1;
    return `${refPrefix}${refIndex}`;
  }
};
TemplateClass._templateSettings = null;
__decorate2([
  bindToClass
], TemplateClass.prototype, "genRef", null);
var WebComponentTemplateManagerMixin = (superFn) => {
  const privateMap = new WeakMap();
  function templateClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new TemplateClass(self)).get(self);
  }
  class WebComponentTemplateManager extends superFn {
    generateHTMLTemplate(strings, ...values) {
      return new TemplateClass.templateResult(strings, values, "html", templateClass(this).templateProcessor);
    }
    static initComplexTemplateProvider(config3) {
      TemplateClass._templateSettings = config3;
    }
    getRef(ref) {
      if (typeof ref !== "string") {
        console.warn("Invalid ref", ref, "on", this);
        return void 0;
      }
      const refNumber = ~~ref.split(refPrefix)[1];
      return templateClass(this).reffed[refNumber];
    }
    getParentRef(ref) {
      const parent = this.getParent();
      if (!parent) {
        console.warn("Could not find parent of", this, "and because of that could not find ref with id", ref);
        return void 0;
      }
      return parent.getRef(ref);
    }
    genRef(value) {
      return templateClass(this).genRef(value);
    }
  }
  __decorate2([
    bindToClass
  ], WebComponentTemplateManager.prototype, "generateHTMLTemplate", null);
  const __typecheck__ = WebComponentTemplateManager;
  __typecheck__;
  return WebComponentTemplateManager;
};

// modules/wc-lib/lib/util/manual.js
function createWatchable(value, listen, writable) {
  return assignAsGetter(value, {
    __watch(key, onChange) {
      listen((value2, changedKey) => {
        if (changedKey && changedKey !== key)
          return;
        onChange(value2[key]);
      });
    },
    __original: value
  }, writable);
}

// modules/wc-lib/lib/props.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var refPrefix = "___complex_ref";
function getterWithVal(component, value, strict, type) {
  if (type === "bool") {
    if (strict) {
      return value + "" === "true";
    }
    return value !== void 0 && value !== null && value !== "false";
  } else {
    if (value !== void 0 && value !== null && value !== "false") {
      if (type === "number") {
        return ~~value;
      } else if (type instanceof ComplexTypeClass) {
        if (value.startsWith(refPrefix)) {
          if (component.getParentRef) {
            return component.getParentRef(value);
          }
          return value;
        } else {
          try {
            return JSON.parse(decodeURIComponent(value));
          } catch (e) {
            console.warn("Failed to parse complex JSON value", decodeURIComponent(value));
            return void 0;
          }
        }
      }
      return value;
    }
    return void 0;
  }
}
function getter(element, name, strict, type) {
  return getterWithVal(element, element.getAttribute(name), strict, type);
}
function setter(setAttrFn, removeAttrFn, name, value, type) {
  if (type === "bool") {
    const boolVal = value;
    if (boolVal) {
      setAttrFn(name, "");
    } else {
      removeAttrFn(name);
    }
  } else {
    const strVal = value;
    if (type instanceof ComplexTypeClass) {
      try {
        setAttrFn(name, encodeURIComponent(JSON.stringify(strVal)));
      } catch (e) {
        setAttrFn(name, encodeURIComponent("_"));
      }
    } else {
      setAttrFn(name, String(strVal));
    }
  }
}
var NARROWED_PROP_TYPE;
(function(NARROWED_PROP_TYPE3) {
  NARROWED_PROP_TYPE3["STRING"] = "string";
  NARROWED_PROP_TYPE3["NUMBER"] = "number";
  NARROWED_PROP_TYPE3["BOOL"] = "bool";
})(NARROWED_PROP_TYPE || (NARROWED_PROP_TYPE = {}));
var ComplexTypeClass = class {
  required() {
    return this;
  }
  optional() {
    return this;
  }
};
function getDefinePropConfig(value) {
  if (typeof value === "object" && "type" in value) {
    const data = value;
    return data;
  } else {
    return {
      coerce: false,
      watch: true,
      strict: false,
      reflectToSelf: true,
      type: value
    };
  }
}
var Watching;
(function(Watching3) {
  function genProxyStructureLevel(pathParts) {
    const currentLevel = new Map();
    for (const path of pathParts) {
      if (!currentLevel.has(path[0])) {
        currentLevel.set(path[0], {
          name: path[0],
          relevantPaths: [],
          watchCurrent: false,
          map: new Map()
        });
      }
      const currentLevelPath = currentLevel.get(path[0]);
      currentLevelPath.watchCurrent = currentLevelPath.watchCurrent || path.length === 1;
      currentLevelPath.relevantPaths.push(path);
    }
    for (const [name, level] of currentLevel) {
      if (name === "*") {
        for (const otherLevel of currentLevel.values()) {
          if (otherLevel.map === level.map)
            continue;
          otherLevel.relevantPaths.push(...level.relevantPaths);
        }
      }
    }
    for (const [, level] of currentLevel) {
      level.relevantPaths = level.relevantPaths.filter((val, index) => {
        return level.relevantPaths.indexOf(val) === index;
      });
    }
    for (const [, level] of currentLevel) {
      level.map = genProxyStructureLevel(level.relevantPaths.map((p) => p.slice(1)).filter((p) => p.length));
    }
    return currentLevel;
  }
  function getProxyStructure(paths) {
    const pathParts = paths.map((p) => p.split("."));
    for (const path of pathParts) {
      for (const pathPart of path) {
        if (pathPart === "**") {
          const retMap = new Map();
          retMap.set("**", {
            name: "**",
            map: new Map()
          });
          return retMap;
        }
      }
    }
    const structure = genProxyStructureLevel(pathParts);
    return structure;
  }
  function canWatchValue(value) {
    return typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp);
  }
  function createDeepProxy(obj, onAccessed) {
    const isArr = Array.isArray(obj);
    const proxy = new Proxy(obj, {
      set(_obj, prop, value) {
        const isPropChange = (() => {
          if (isArr) {
            if (typeof prop === "symbol")
              return true;
            if (typeof prop === "number" || !Number.isNaN(parseInt(prop))) {
              return true;
            }
            return false;
          } else {
            return true;
          }
        })();
        if (isPropChange) {
          const originalValue = value;
          if (canWatchValue(value) && value !== null) {
            value = createDeepProxy(value, onAccessed);
          }
          const oldValue = obj[prop];
          obj[prop] = value;
          if (oldValue !== originalValue) {
            onAccessed();
          }
        } else {
          obj[prop] = value;
        }
        return true;
      },
      deleteProperty(_obj, prop) {
        if (Reflect.has(obj, prop)) {
          const deleted = Reflect.deleteProperty(obj, prop);
          onAccessed();
          return deleted;
        }
        return true;
      }
    });
    for (const key of Object.keys(obj)) {
      if (canWatchValue(obj[key])) {
        obj[key] = createDeepProxy(obj[key], onAccessed);
      }
    }
    return proxy;
  }
  function watchObjectLevel(obj, level, onAccessed) {
    if (!obj)
      return obj;
    const isArr = Array.isArray(obj);
    const proxy = new Proxy(obj, {
      set(_obj, prop, value) {
        const isPropChange = (() => {
          if (isArr) {
            if (level.has("*")) {
              if (typeof prop === "symbol")
                return true;
              return typeof prop === "number" || !Number.isNaN(parseInt(prop));
            }
            if (typeof prop !== "symbol" && level.has(prop + "") && level.get(prop + "").watchCurrent) {
              return true;
            }
            return false;
          } else {
            if (typeof prop !== "symbol") {
              return level.get(prop + "") && level.get(prop + "").watchCurrent || level.get("*") && level.get("*").watchCurrent;
            }
            return level.has("*") && level.get("*").watchCurrent;
          }
        })();
        if (isPropChange) {
          const nextLevel = typeof prop !== "symbol" && level.get(prop + "") || level.get("*");
          if (nextLevel.map.size && canWatchValue(value)) {
            value = watchObjectLevel(value, nextLevel.map, onAccessed);
          }
          const accessProp = (() => {
            if (isArr) {
              if (typeof prop === "symbol")
                return prop;
              return parseInt(prop + "");
            } else {
              return prop;
            }
          })();
          const oldValue = obj[accessProp];
          obj[accessProp] = value;
          if (oldValue !== value) {
            onAccessed();
          }
        } else {
          obj[prop] = value;
        }
        return true;
      },
      deleteProperty(_obj, prop) {
        if (Reflect.has(obj, prop)) {
          const deleted = Reflect.deleteProperty(obj, prop);
          if (deleted && (typeof prop !== "symbol" && level.get(prop + "") && level.get(prop + "").watchCurrent || level.get("*") && level.get("*").watchCurrent)) {
            onAccessed();
          }
          return deleted;
        }
        return true;
      }
    });
    for (const name of Object.keys(obj)) {
      if ((level.has(name) || level.has("*")) && canWatchValue(obj[name])) {
        obj[name] = watchObjectLevel(obj[name], (level.get(name) || level.get("*")).map, onAccessed);
      }
    }
    return proxy;
  }
  function watchObject(obj, properties, callback) {
    if (typeof obj !== "object" || obj === void 0 || obj === null || typeof HTMLElement !== "undefined" && obj instanceof HTMLElement) {
      return obj;
    }
    if (typeof Proxy === "undefined") {
      console.warn("Attempted to watch object while proxy method is not supported");
      return obj;
    }
    if (properties.has("**")) {
      return createDeepProxy(obj, callback);
    } else {
      return watchObjectLevel(obj, properties, callback);
    }
  }
  function watchValue(render2, value, watch, watchProperties) {
    if (canWatchValue(value) && (watch || watchProperties.length > 0)) {
      value = watchObject(value, watchProperties.length ? getProxyStructure(watchProperties) : new Map([
        [
          "*",
          {
            name: "*",
            relevantPaths: [],
            watchCurrent: true,
            map: new Map()
          }
        ]
      ]), () => {
        render2(CHANGE_TYPE.PROP);
      });
    }
    return value;
  }
  Watching3.watchValue = watchValue;
})(Watching || (Watching = {}));
var cachedCasing = new Map();
function dashesToCasing(name) {
  const cached = cachedCasing.get(name);
  if (cached) {
    return cached;
  }
  if (name.indexOf("-") === -1)
    return name;
  let newStr = "";
  for (let i = 0; i < name.length; i++) {
    if (name[i] === "-") {
      newStr += name[i + 1].toUpperCase();
      i++;
    } else {
      newStr += name[i];
    }
  }
  cachedCasing.set(name, newStr);
  return newStr;
}
function casingToDashes(name) {
  if (!/[A-Z]/.test(name))
    return name;
  let newStr = "";
  for (const char of name) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      newStr += "-" + char.toLowerCase();
    } else {
      newStr += char;
    }
  }
  return newStr;
}
function getNarrowedType(propType) {
  switch (propType) {
    case PROP_TYPE.STRING:
    case PROP_TYPE.STRING_OPTIONAL:
    case PROP_TYPE.STRING_REQUIRED:
      return NARROWED_PROP_TYPE.STRING;
    case PROP_TYPE.BOOL:
    case PROP_TYPE.BOOL_OPTIONAL:
    case PROP_TYPE.BOOL_REQUIRED:
      return NARROWED_PROP_TYPE.BOOL;
    case PROP_TYPE.NUMBER:
    case PROP_TYPE.NUMBER_OPTIONAL:
    case PROP_TYPE.NUMBER_REQUIRED:
      return NARROWED_PROP_TYPE.NUMBER;
  }
  return propType;
}
function getCoerced(initial, mapType) {
  switch (getNarrowedType(mapType)) {
    case NARROWED_PROP_TYPE.STRING:
      return initial || "";
    case NARROWED_PROP_TYPE.BOOL:
      return initial || false;
    case NARROWED_PROP_TYPE.NUMBER:
      return initial || 0;
  }
  return initial;
}
var connectMap = new WeakMap();
var connectedElements = new WeakSet();
function hookIntoConnect(el, fn) {
  return __awaiter(this, void 0, void 0, function* () {
    if (connectedElements.has(el)) {
      fn();
      return;
    }
    yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
      const arr = connectMap.get(el) || [];
      arr.push(() => {
        fn();
        resolve();
      });
      connectMap.set(el, arr);
    }));
  });
}
var PropsDefiner;
(function(PropsDefiner3) {
  const renderMap = new WeakMap();
  function queueRender(element, changeType, changeKey) {
    if (!renderMap.has(element.component)) {
      renderMap.set(element.component, changeType);
    }
    setTimeout(() => {
      element.component.renderToDOM(renderMap.get(element.component));
      element.changeListeners.forEach((l) => l(changeKey));
      renderMap.delete(element.component);
    }, 0);
  }
  function createQueueRenderFn(element, changeKey) {
    return (changeType) => {
      queueRender(element, changeType, changeKey);
    };
  }
  class ElementRepresentation {
    constructor(component) {
      this.component = component;
      this.keyMap = new Map();
      this.propValues = {};
      this.onConnectMap = new Map();
      this.changeListeners = [];
      this.setAttr = component.setAttribute.bind(component);
      this.removeAttr = component.removeAttribute.bind(component);
      this.onDone = new Promise((resolve) => {
        this._onDoneResolve = resolve;
      });
    }
    overrideAttributeFunctions() {
      this.component.setAttribute = (key, val) => {
        if (!this.component.isMounted) {
          this.onConnect(dashesToCasing(key), () => {
            onSetAttribute(key, val, this);
          }, true);
          this.setAttr(key, val);
          return;
        }
        onSetAttribute(key, val, this);
      };
      this.component.removeAttribute = (key) => {
        if (!this.component.isMounted) {
          this.onConnect(dashesToCasing(key), () => {
            onRemoveAttribute(key, this);
          }, true);
          this.removeAttr(key);
          return;
        }
        onRemoveAttribute(key, this);
      };
    }
    onConnect(key, listener, force) {
      if (connectedElements.has(this.component)) {
        listener();
        return;
      }
      if (this.onConnectMap.has(key) && !force)
        return;
      this.onConnectMap.set(key, listener);
    }
    connected() {
      [...this.onConnectMap.values()].forEach((listener) => {
        listener();
      });
      this._onDoneResolve();
      if (!this.component.isSSR) {
        queueRender(this, CHANGE_TYPE.PROP);
      }
    }
  }
  function getKeys({reflect = {}, priv = {}}) {
    return [
      ...Object.getOwnPropertyNames(reflect).map((key) => {
        return {
          key,
          value: reflect[key],
          reflectToAttr: true
        };
      }),
      ...Object.getOwnPropertyNames(priv).map((key) => {
        return {
          key,
          value: priv[key],
          reflectToAttr: false
        };
      })
    ];
  }
  function onSetAttribute(key, val, el) {
    const casingKey = dashesToCasing(key);
    if (el.keyMap.has(casingKey)) {
      const {watch, mapType, strict} = el.keyMap.get(casingKey);
      const prevVal = el.propValues[casingKey];
      const newVal = getterWithVal(el.component, val, strict, getNarrowedType(mapType));
      if (prevVal === newVal)
        return;
      el.component.fire("beforePropChange", casingKey, newVal, prevVal);
      el.propValues[casingKey] = newVal;
      el.component.fire("propChange", casingKey, newVal, prevVal);
      if (watch) {
        queueRender(el, CHANGE_TYPE.PROP, casingKey);
      }
    } else {
      el.propValues[casingKey] = val;
    }
    el.setAttr(key, val);
  }
  function onRemoveAttribute(key, el) {
    const casingKey = dashesToCasing(key);
    if (el.keyMap.has(casingKey)) {
      const {watch, coerce, mapType} = el.keyMap.get(casingKey);
      const prevVal = el.propValues[casingKey];
      const newVal = (() => {
        if (coerce) {
          return getCoerced(void 0, mapType);
        }
        if (getNarrowedType(mapType) === NARROWED_PROP_TYPE.BOOL) {
          return false;
        }
        return void 0;
      })();
      if (prevVal !== newVal) {
        el.component.fire("beforePropChange", casingKey, newVal, prevVal);
        el.propValues[casingKey] = newVal;
        el.component.fire("propChange", casingKey, newVal, prevVal);
        el.changeListeners.forEach((l) => l(casingKey));
        if (watch) {
          queueRender(el, CHANGE_TYPE.PROP, casingKey);
        }
      }
    }
    el.removeAttr(key);
  }
  const elementConfigs = new WeakMap();
  class Property {
    constructor(_propertyConfig, _rep, _props) {
      this._propertyConfig = _propertyConfig;
      this._rep = _rep;
      this._props = _props;
      this.__config = null;
    }
    __getConfig() {
      const {key, value, reflectToAttr} = this._propertyConfig;
      const mapKey = key;
      const propName = casingToDashes(mapKey);
      const {watch = true, coerce = false, defaultValue, value: defaultValue2, type, strict = false, watchProperties = [], reflectToSelf = true, description} = getDefinePropConfig(value);
      return {
        watch,
        coerce,
        type,
        strict,
        watchProperties,
        reflectToSelf,
        mapKey,
        key,
        reflectToAttr,
        propName,
        defaultValue: defaultValue !== void 0 ? defaultValue : defaultValue2,
        description: description || ""
      };
    }
    get config() {
      if (this.__config) {
        return this.__config;
      }
      return this.__config = this.__getConfig();
    }
    setKeyMap(keyMap) {
      const {key} = this._propertyConfig;
      const {watch, coerce, type: mapType, strict, reflectToAttr} = this.config;
      keyMap.set(key, {
        watch,
        coerce,
        mapType,
        strict,
        reflectToAttr
      });
    }
    _setReflect() {
      const _this = this;
      const {mapKey} = this.config;
      if (mapKey in this._rep.component)
        return;
      Object.defineProperty(this._rep.component, mapKey, {
        get() {
          return _this._rep.propValues[mapKey];
        },
        enumerable: true,
        set(value) {
          const props = _this._props;
          if (props[mapKey] === value)
            return;
          props[mapKey] = value;
        }
      });
    }
    setReflect() {
      const {reflectToSelf} = this.config;
      if (reflectToSelf) {
        this._setReflect();
      }
    }
    setPropAccessors() {
      const _this = this;
      const {mapKey, coerce, type, key, watch, watchProperties, propName} = this.config;
      Object.defineProperty(this._props, mapKey, {
        get() {
          const value = _this._rep.propValues[mapKey];
          if (coerce) {
            return getCoerced(value, type);
          }
          return value;
        },
        enumerable: true,
        set(value) {
          const original = value;
          value = Watching.watchValue(createQueueRenderFn(_this._rep, mapKey), value, watch, watchProperties);
          if (_this._props[mapKey] === value)
            return;
          const prevVal = _this._rep.propValues[mapKey];
          _this._rep.component.fire("beforePropChange", key, value, prevVal);
          _this._rep.propValues[mapKey] = value;
          _this._rep.component.fire("propChange", key, value, prevVal);
          _this._rep.changeListeners.forEach((l) => l(key));
          if (_this._propertyConfig.reflectToAttr) {
            setter(_this._rep.setAttr, _this._rep.removeAttr, propName, original, getNarrowedType(type));
          }
          if (watch) {
            queueRender(_this._rep, CHANGE_TYPE.PROP, mapKey);
          }
        }
      });
    }
    assignComplexType() {
      return __awaiter(this, void 0, void 0, function* () {
        const {type, mapKey, propName, strict, watch, watchProperties} = this.config;
        this._rep.onConnect(mapKey, () => {
          this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep, mapKey), this._rep.component.hasAttribute(propName) ? getter(this._rep.component, propName, strict, getNarrowedType(type)) : void 0, watch, watchProperties);
        }, false);
      });
    }
    assignSimpleType() {
      const {type, mapKey, propName, strict, watch, watchProperties} = this.config;
      this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep, mapKey), this._rep.component.hasAttribute(propName) || strict && type === "bool" ? getter(this._rep.component, propName, strict, getNarrowedType(type)) : void 0, watch, watchProperties);
    }
    doDefaultAssign() {
      const {defaultValue, mapKey, watch, watchProperties, propName, type, reflectToAttr} = this.config;
      if (defaultValue !== void 0) {
        if (this._rep.propValues[mapKey] === void 0) {
          this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep, mapKey), defaultValue, watch, watchProperties);
        }
        if (reflectToAttr) {
          setter(this._rep.setAttr, this._rep.removeAttr, propName, this._rep.propValues[mapKey], type);
        }
      } else if (type instanceof ComplexTypeClass && reflectToAttr) {
        setter(this._rep.setAttr, this._rep.removeAttr, propName, this._rep.propValues[mapKey], type);
      }
    }
  }
  function defineProperties(element, props, config3) {
    const keys = getKeys(config3);
    const properties = keys.map((key) => new Property(key, element, props));
    properties.forEach((property) => property.setKeyMap(element.keyMap));
    properties.forEach((property) => property.setReflect());
    properties.forEach((property) => property.setPropAccessors());
    return Promise.all(properties.map((property) => {
      if (!(property.config.type instanceof ComplexTypeClass)) {
        property.assignSimpleType();
        element.onConnect(property.config.mapKey, () => {
          property.doDefaultAssign();
        }, false);
        return element.onDone;
      }
      element.onConnect(property.config.mapKey, () => {
        property.assignComplexType();
        property.doDefaultAssign();
      }, false);
      return element.onDone;
    }));
  }
  function define3(props, component, config3) {
    const element = new ElementRepresentation(component);
    element.overrideAttributeFunctions();
    if (component.isSSR) {
      element.connected();
      connectedElements.add(component);
    } else {
      hookIntoConnect(component, () => {
        element.connected();
      });
    }
    elementConfigs.set(props, {
      composite: false,
      element
    });
    return {
      awaitable: defineProperties(element, props, config3),
      addListener(changeListener) {
        element.changeListeners.push(changeListener);
      }
    };
  }
  PropsDefiner3.define = define3;
  function joinProps(previousProps, config3) {
    var _a, _b;
    if (!elementConfigs.has(previousProps)) {
      throw new Error("Previous props not defined");
    }
    const {element} = elementConfigs.get(previousProps);
    elementConfigs.set(previousProps, {
      composite: true,
      element
    });
    const joinedConfig = {};
    for (const key of ["reflect", "priv"]) {
      if (((_a = previousProps.__config) === null || _a === void 0 ? void 0 : _a[key]) || config3[key]) {
        joinedConfig[key] = Object.assign(Object.assign({}, (_b = previousProps.__config) === null || _b === void 0 ? void 0 : _b[key]), config3[key]);
      }
    }
    previousProps.__config = joinedConfig;
    return {
      awaitable: defineProperties(element, previousProps, config3),
      addListener(changeListener) {
        element.changeListeners.push(changeListener);
      }
    };
  }
  PropsDefiner3.joinProps = joinProps;
})(PropsDefiner || (PropsDefiner = {}));
var propConfigs = new Map();
var Props = class {
  constructor(__config) {
    this.__config = __config;
  }
  static define(element, config3 = {}, parentProps = element.props) {
    const tag = element.tagName.toLowerCase();
    if (propConfigs.has(tag)) {
      propConfigs.set(tag, Object.assign(Object.assign({}, propConfigs.get(tag)), config3));
    } else {
      propConfigs.set(tag, config3);
    }
    if (parentProps && !(typeof parentProps === "object" && Object.keys(parentProps).length === 0 && !(parentProps instanceof Props))) {
      if (typeof parentProps === "object" && "__original" in parentProps) {
        parentProps = parentProps.__original;
      }
      if (typeof parentProps !== "object" || !(parentProps instanceof Props)) {
        throw new Error("Parent props should be a Props object");
      }
      const {addListener: addListener2} = PropsDefiner.joinProps(parentProps, config3);
      return createWatchable(parentProps, (onChange) => {
        addListener2((changedKey) => {
          onChange(parentProps, changedKey);
        });
      }, true);
    }
    const props = new Props(config3);
    const {addListener} = PropsDefiner.define(props, element, config3);
    return createWatchable(props, (onChange) => {
      addListener((changedKey) => {
        onChange(props, changedKey);
      });
    }, true);
  }
  static onConnect(element) {
    if (connectMap.has(element)) {
      for (const listener of connectMap.get(element)) {
        listener();
      }
    }
    connectedElements.add(element);
  }
};

// modules/wc-lib/lib/jsx-render.js
function convertSpecialAttrs(attrs) {
  if (!attrs)
    return attrs;
  const specialAttrs = attrs;
  if (specialAttrs.__listeners || specialAttrs["@"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__listeners), specialAttrs["@"]);
    for (const key in specialProps) {
      attrs[`@${key}`] = specialProps[key];
    }
    delete specialAttrs.__listeners;
    delete specialAttrs["@"];
  }
  if (specialAttrs.__component_listeners || specialAttrs["@@"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__component_listeners), specialAttrs["@@"]);
    for (const key in specialProps) {
      attrs[`@@${key}`] = specialProps[key];
    }
    delete specialAttrs.__component_listeners;
    delete specialAttrs["@@"];
  }
  if (specialAttrs.__bools || specialAttrs["?"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__bools), specialAttrs["?"]);
    for (const key in specialProps) {
      attrs[`?${key}`] = specialProps[key];
    }
    delete specialAttrs.__bools;
    delete specialAttrs["?"];
  }
  if (specialAttrs.__refs || specialAttrs["#"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__refs), specialAttrs["#"]);
    for (const key in specialProps) {
      attrs[`#${key}`] = specialProps[key];
    }
    delete specialAttrs.__refs;
    delete specialAttrs["#"];
  }
  return attrs;
}
var Fragment = Symbol("fragment");
var _Fragment = Fragment;
var JSXDelayedExecutionCall = class {
  constructor(tag, attrs, children) {
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
  }
  collapse(templater) {
    let collapsed = jsxToLiteral(this.tag, this.attrs, ...collapseDeeply(this.children, templater));
    if (collapsed instanceof JSXDelayedExecutionCall) {
      while (collapsed instanceof JSXDelayedExecutionCall) {
        collapsed = collapsed.collapse(templater);
      }
      return collapsed;
    }
    const {strings, values} = collapsed;
    return templater(strings, ...values);
  }
};
function jsx(tag, attrs, ...children) {
  return new JSXDelayedExecutionCall(tag, attrs, children);
}
var _jsx = jsx;
var html;
(function(html3) {
  function jsx3(tag, attrs, ...children) {
    return _jsx(tag, attrs, ...children);
  }
  html3.jsx = jsx3;
  function Fragment3() {
    return _Fragment;
  }
  html3.Fragment = Fragment3;
  function F() {
    return _Fragment;
  }
  html3.F = F;
})(html || (html = {}));
function isDefined(name) {
  if (typeof window === "undefined" || !window.customElements)
    return true;
  if (window.customElements.get(name)) {
    return true;
  }
  return false;
}
function containsDelayedExecutions(items, checked = new Set()) {
  return items.some((item) => {
    if (item instanceof JSXDelayedExecutionCall) {
      return true;
    }
    const found = checked.has(item);
    checked.add(item);
    if (Array.isArray(item) && !found) {
      return containsDelayedExecutions(item, checked);
    }
    return false;
  });
}
function collapseDeeply(items, templater, checked = new Set()) {
  return items.map((item) => {
    if (item instanceof JSXDelayedExecutionCall) {
      return item.collapse(templater);
    }
    const found = checked.has(item);
    checked.add(item);
    if (Array.isArray(item) && !found) {
      return collapseDeeply(item, templater, checked);
    }
    return item;
  });
}
function jsxToLiteral(tag, attrs, ...children) {
  var _a;
  if (containsDelayedExecutions(children)) {
    return jsx(tag, attrs, ...children);
  }
  let tagName;
  if (typeof tag === "string") {
    tagName = tag;
  } else if ((typeof tag === "object" || typeof tag === "function") && "is" in tag) {
    tagName = tag.is;
    if (!isDefined(tag.is)) {
      (_a = tag.define) === null || _a === void 0 ? void 0 : _a.call(tag);
    }
  } else if (typeof tag === "function") {
    const returnValue = tag(attrs || {});
    if (returnValue !== _Fragment) {
      return returnValue;
    }
    const filteredChildren2 = children.filter((child) => child !== false);
    const strings2 = new Array(filteredChildren2.length + 1).fill("");
    const stringsArr = strings2;
    stringsArr.raw = strings2;
    return {
      strings: stringsArr,
      values: filteredChildren2
    };
  } else {
    console.warn("Unknown tag value");
    return {strings: [], values: []};
  }
  const strings = [];
  const values = [];
  let openTagClosed = false;
  const newAttrs = convertSpecialAttrs(attrs);
  const hasAttrs = !!(newAttrs && Object.getOwnPropertyNames(newAttrs).length);
  const filteredChildren = children.filter((child) => child !== false);
  const hasChildren = !!filteredChildren.length;
  if (!hasAttrs && !hasChildren) {
    strings.push(`<${tagName}></${tagName}>`);
    const arr2 = strings;
    arr2.raw = strings;
    return {
      strings: arr2,
      values
    };
  }
  if (hasAttrs) {
    let firstArg = true;
    for (const key in newAttrs) {
      const attrName = casingToDashes(key);
      if (firstArg) {
        strings.push(`<${tagName} ${attrName}="`);
        firstArg = false;
      } else {
        strings.push(`" ${attrName}="`);
      }
      values.push(newAttrs[key]);
    }
  } else {
    strings.push(`<${tagName}>`);
    openTagClosed = true;
  }
  if (hasChildren) {
    for (const child of filteredChildren.slice(0, filteredChildren.length - 1)) {
      if (!openTagClosed) {
        strings.push(`">`);
        openTagClosed = true;
      }
      strings.push("");
      values.push(child);
    }
    values.push(filteredChildren[filteredChildren.length - 1]);
    if (!openTagClosed) {
      strings.push(`">`);
      openTagClosed = true;
    }
    strings.push(`</${tagName}>`);
  } else {
    strings.push(`"></${tagName}>`);
  }
  const arr = strings;
  arr.raw = strings;
  return {
    strings: arr,
    values
  };
}

// modules/wc-lib/lib/template-fn.js
var changeTypes = new Set([1, 2, 4, 8, 16, 32]);
var templaterMap = new WeakMap();
var TemplateFn = class {
  constructor(_template, _changeOn, _renderer) {
    this._template = _template;
    this._changeOn = _changeOn;
    this._renderer = _renderer;
    this._lastRenderChanged = true;
  }
  get _changeOnAll() {
    return [...changeTypes.values()].reduce((prev, current) => {
      return prev | current;
    }, 0);
  }
  get changeOn() {
    if (this._changeOn === CHANGE_TYPE.ALWAYS) {
      return this._changeOnAll;
    }
    return this._changeOn;
  }
  _renderWithTemplater(changeType, component, templater) {
    if (!templater || typeof templater !== "object" && typeof templater !== "function") {
      templater = component;
    }
    if (!templaterMap.has(templater)) {
      templaterMap.set(templater, new WeakMap());
    }
    const componentTemplateMap = templaterMap.get(templater);
    const jsxAddedTemplate = typeof templater === "function" ? templater.bind(component) : templater;
    jsxAddedTemplate.jsx = (tag, attrs, ...children) => {
      const jsxResult = jsxToLiteral(tag, attrs, ...children);
      if (jsxResult instanceof JSXDelayedExecutionCall)
        return jsxResult;
      const {strings, values} = jsxResult;
      return templater(strings, ...values);
    };
    jsxAddedTemplate.Fragment = jsxAddedTemplate.F = () => Fragment;
    if (!componentTemplateMap.has(component)) {
      componentTemplateMap.set(component, new WeakMap());
    }
    const templateMap = componentTemplateMap.get(component);
    if (this.changeOn === CHANGE_TYPE.NEVER) {
      const cached = templateMap.get(this);
      if (cached && changeType !== CHANGE_TYPE.FORCE) {
        return {
          changed: false,
          rendered: cached
        };
      }
      let rendered = this._template === null ? null : this._template.call(component, jsxAddedTemplate, "getRenderArgs" in component && component.getRenderArgs ? component.getRenderArgs(changeType) : {});
      if (rendered instanceof JSXDelayedExecutionCall) {
        rendered = rendered.collapse(templater);
      }
      templateMap.set(this, rendered);
      return {
        changed: true,
        rendered
      };
    }
    if (changeType === CHANGE_TYPE.ALWAYS) {
      changeType = this._changeOnAll;
    }
    if (this.changeOn & changeType || !templateMap.has(this)) {
      let rendered = this._template.call(component, jsxAddedTemplate, "getRenderArgs" in component && component.getRenderArgs ? component.getRenderArgs(changeType) : {});
      if (rendered instanceof JSXDelayedExecutionCall) {
        rendered = rendered.collapse(templater);
      }
      templateMap.set(this, rendered);
      return {
        changed: true,
        rendered
      };
    }
    return {
      changed: false,
      rendered: templateMap.get(this)
    };
  }
  static _textRenderer(strings, ...values) {
    const result = [strings[0]];
    for (let i = 0; i < values.length; i++) {
      result.push(values[i], strings[i + 1]);
    }
    return result.join("");
  }
  static _templateResultToText(result) {
    if (result === null || result === void 0)
      return "";
    if (typeof HTMLElement !== "undefined" && result instanceof HTMLElement || typeof Element !== "undefined" && result instanceof Element) {
      return `<${result.tagName.toLowerCase()} ${Array.from(result.attributes).map((attr) => {
        return `${attr.name}="${attr.value}"`;
      }).join(" ")}>${result.innerHTML}</${result.tagName.toLowerCase()}>`;
    }
    if ("toText" in result && typeof result.toText === "function") {
      return result.toText();
    }
    if ("strings" in result && "values" in result) {
      return this._textRenderer(result.strings, ...result.values);
    }
    throw new Error("Failed to convert template to text because there is no .toText() and no .strings and .values properties either (see TemplateRenderResult)");
  }
  renderAsText(changeType, component) {
    const {changed, rendered} = this._renderWithTemplater(changeType, component, TemplateFn._textRenderer);
    this._lastRenderChanged = changed;
    if (typeof rendered !== "string") {
      return TemplateFn._templateResultToText(rendered);
    }
    return rendered;
  }
  renderTemplate(changeType, component) {
    const {changed, rendered} = this._renderWithTemplater(changeType, component, component.generateHTMLTemplate);
    this._lastRenderChanged = changed;
    return rendered;
  }
  renderSame(changeType, component, templater) {
    const {changed, rendered} = this._renderWithTemplater(changeType, component, templater);
    this._lastRenderChanged = changed;
    return rendered;
  }
  render(template, target) {
    if (template === null)
      return;
    if (template instanceof HTMLElement || template instanceof Element) {
      target.appendChild(template);
      return;
    }
    if (this._renderer) {
      this._renderer(template, target);
    } else {
      throw new Error("Missing renderer");
    }
  }
  renderIfNew(template, target) {
    if (!this._lastRenderChanged)
      return;
    this.render(template, target);
  }
};

// modules/wc-lib/lib/custom-css-manager.js
var CustomCSSClass = class {
  constructor(_self) {
    this._self = _self;
    this.hasCustomCSS = null;
    this.__noCustomCSS = new TemplateFn(null, CHANGE_TYPE.NEVER, null);
  }
  getCustomCSS() {
    if (!this._self.__hasCustomCSS()) {
      return this.__noCustomCSS;
    }
    return this._self.getParentRef(this._self.getAttribute(CUSTOM_CSS_PROP_NAME));
  }
};
var WebComponentCustomCSSManagerMixin = (superFn) => {
  const privateMap = new WeakMap();
  function customCSSClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new CustomCSSClass(self)).get(self);
  }
  class WebComponentCustomCSSManager extends superFn {
    constructor(...args) {
      super(...args);
      this.isMounted = false;
      const originalSetAttr = this.setAttribute;
      this.setAttribute = (key, val) => {
        originalSetAttr.bind(this)(key, val);
        if (key === CUSTOM_CSS_PROP_NAME && this.isMounted) {
          this.renderToDOM(CHANGE_TYPE.ALWAYS);
        }
      };
    }
    __hasCustomCSS() {
      const priv = customCSSClass(this);
      if (priv.hasCustomCSS !== null) {
        return priv.hasCustomCSS;
      }
      if (!this.hasAttribute(CUSTOM_CSS_PROP_NAME) || !this.getParentRef(this.getAttribute(CUSTOM_CSS_PROP_NAME))) {
        if (this.isMounted) {
          priv.hasCustomCSS = false;
        }
        return false;
      }
      return priv.hasCustomCSS = true;
    }
    customCSS() {
      return customCSSClass(this).getCustomCSS();
    }
  }
  const __typecheck__ = WebComponentCustomCSSManager;
  __typecheck__;
  return WebComponentCustomCSSManager;
};

// modules/wc-lib/lib/hierarchy-manager.js
var __decorate3 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HierarchyClass = class {
  constructor(_self, _getGetPrivate) {
    this._self = _self;
    this._getGetPrivate = _getGetPrivate;
    this.children = new Set();
    this.parent = null;
    this.globalProperties = {};
    this.isSubTreeRoot = false;
    this.subtreeProps = {};
    this.subtreeChangeListeners = [];
    this.globalPropertyChangeListeners = [];
    this.globalPropsFns = null;
  }
  __getParent() {
    return this.parent;
  }
  __isHierarchyManagerInstance(element) {
    return HierarchyClass.hierarchyClasses.has(element);
  }
  getGlobalProperties() {
    const props = {};
    for (let i = 0; i < this._self.attributes.length; i++) {
      const attr = this._self.attributes[i];
      if (attr.name.startsWith("prop_")) {
        props[attr.name.slice("prop_".length)] = decodeURIComponent(attr.value);
      }
    }
    return props;
  }
  __findLocalRoot() {
    let element = this._self.parentNode;
    while (element && !(element instanceof window.ShadowRoot) && element !== document && !(element instanceof DocumentFragment)) {
      element = element.parentNode;
    }
    if (!element) {
      return null;
    }
    if (element === document) {
      return this._self;
    }
    const host = (() => {
      if (this.__isHierarchyManagerInstance(element)) {
        return element;
      } else {
        return element.host;
      }
    })();
    if (!this.__isHierarchyManagerInstance(host)) {
      return null;
    }
    return host;
  }
  findDirectParents(onNode) {
    onNode === null || onNode === void 0 ? void 0 : onNode(this._self);
    let element = this._self.parentNode;
    while (element && !(element instanceof window.ShadowRoot) && element !== document && !(element instanceof DocumentFragment) && !this.__isHierarchyManagerInstance(element)) {
      onNode === null || onNode === void 0 ? void 0 : onNode(element);
      element = element.parentNode;
    }
    element && (onNode === null || onNode === void 0 ? void 0 : onNode(element));
    if (!element) {
      return null;
    }
    if (element === document) {
      return this._self;
    } else {
      const host = this.__isHierarchyManagerInstance(element) ? element : element.host;
      if (!this.__isHierarchyManagerInstance(host)) {
        return null;
      }
      return host;
    }
  }
  __getRoot() {
    const localRoot = this.__findLocalRoot();
    if (localRoot !== null && localRoot !== this._self) {
      return localRoot;
    }
    return this.findDirectParents();
  }
  registerToParent() {
    const root = this.__getRoot();
    if (root === this._self) {
      this.isRoot = true;
      return;
    } else if (root === null) {
      return;
    }
    this.parent = root;
    const newProps = Object.assign({}, root.registerChild(this._self));
    for (const key in newProps) {
      this.setGlobalProperty(key, newProps[key], false);
    }
  }
  __subtreeChangeNotifyChildren() {
    this.__propagateDown((element) => {
      element.renderToDOM(CHANGE_TYPE.SUBTREE_PROPS);
      const priv = this._getGetPrivate()(element);
      const listeners = priv.subtreeChangeListeners;
      if (listeners.length) {
        const subtreeValue = priv.getSubtreeProps();
        listeners.forEach((l) => l(subtreeValue));
      }
    }, []);
  }
  registerAsSubTreeRoot(props) {
    this.isSubTreeRoot = true;
    this.subtreeProps = props;
    this.__subtreeChangeNotifyChildren();
  }
  setSubTreeProps(props) {
    if (!this.isSubTreeRoot) {
      throw new Error("Can't set subtree props if node has not been registered as a subtree yet. Call this.registerAsSubTreeRoot(props) first");
    }
    this.isSubTreeRoot = true;
    this.subtreeProps = props;
    this.__subtreeChangeNotifyChildren();
  }
  clearNonExistentChildren() {
    const nodeChildren = Array.prototype.slice.apply(this._self.children);
    for (const child of this.children.values()) {
      if (!this._self.shadowRoot.contains(child) && !nodeChildren.filter((nodeChild) => nodeChild.contains(child)).length) {
        this.children.delete(child);
      }
    }
  }
  setGlobalProperty(key, value, doRender = true) {
    if (this.globalProperties[key] !== value) {
      const oldVal = this.globalProperties[key];
      this.globalProperties[key] = value;
      this._self.fire("globalPropChange", key, value, oldVal);
      this.globalPropertyChangeListeners.forEach((l) => l(this.globalProperties, key));
      if (doRender) {
        this._self.renderToDOM(CHANGE_TYPE.GLOBAL_PROPS);
      }
    }
  }
  propagateThroughTree(fn) {
    if (this.isRoot) {
      const results = [];
      this.__propagateDown(fn, results);
      return results;
    } else if (this.parent) {
      return this._getGetPrivate()(this.parent).propagateThroughTree(fn);
    } else {
      return [];
    }
  }
  __propagateDown(fn, results) {
    results.push(fn(this._self));
    for (const child of this.children) {
      this._getGetPrivate()(child).__propagateDown(fn, results);
    }
  }
  __getAllInPathToRoot() {
    const allNodes = [];
    let prevNode = null;
    let resultingNode = this._self;
    do {
      prevNode = resultingNode;
      resultingNode = this._getGetPrivate()(resultingNode).findDirectParents((node) => {
        allNodes.push(node);
      });
    } while (resultingNode !== null && prevNode && resultingNode !== prevNode);
    return allNodes.filter((value, index, arr) => arr.indexOf(value) === index);
  }
  getSubtreeRoots() {
    const nodes = this.__getAllInPathToRoot();
    return nodes.filter((node) => {
      return this._getGetPrivate()(node).isSubTreeRoot;
    }).reverse();
  }
  getSubtreeProps() {
    return this.getSubtreeRoots().reduce((prev, current) => {
      return Object.assign(Object.assign({}, prev), this._getGetPrivate()(current).subtreeProps);
    }, {});
  }
};
HierarchyClass.hierarchyClasses = new WeakSet();
__decorate3([
  bindToClass
], HierarchyClass.prototype, "registerToParent", null);
var WebComponentHierarchyManagerMixin = (superFn) => {
  const privateMap = new WeakMap();
  function hierarchyClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new HierarchyClass(self, () => hierarchyClass)).get(self);
  }
  class WebComponentHierarchyManager extends superFn {
    constructor(...args) {
      super(...args);
      HierarchyClass.hierarchyClasses.add(this);
    }
    connectedCallback() {
      super.connectedCallback();
      const priv = hierarchyClass(this);
      priv.isRoot = this.hasAttribute("_root");
      priv.globalProperties = {};
      priv.registerToParent();
      if (priv.isRoot) {
        priv.globalProperties = Object.assign({}, priv.getGlobalProperties());
      }
    }
    registerChild(element) {
      const priv = hierarchyClass(this);
      priv.clearNonExistentChildren();
      priv.children.add(element);
      return priv.globalProperties;
    }
    registerAsSubTreeRoot(props = {}) {
      const priv = hierarchyClass(this);
      priv.registerAsSubTreeRoot(props);
    }
    setSubTreeProps(props) {
      const priv = hierarchyClass(this);
      priv.setSubTreeProps(props);
    }
    getSubtreeRoots() {
      const priv = hierarchyClass(this);
      return priv.getSubtreeRoots();
    }
    getSubTreeProps() {
      return hierarchyClass(this).getSubtreeProps();
    }
    globalProps() {
      const priv = hierarchyClass(this);
      if (priv.globalPropsFns) {
        return priv.globalPropsFns;
      }
      const __this = this;
      const fns = {
        get all() {
          return hierarchyClass(__this).globalProperties;
        },
        get(key) {
          if (!hierarchyClass(__this).globalProperties) {
            return void 0;
          }
          return hierarchyClass(__this).globalProperties[key];
        },
        set(key, value) {
          if (!hierarchyClass(__this).parent && !hierarchyClass(__this).isRoot) {
            console.warn(`Failed to propagate global property "${key}" since this element has no registered parent`);
            return;
          }
          hierarchyClass(__this).propagateThroughTree((element) => {
            hierarchyClass(element).setGlobalProperty(key, value);
          });
        }
      };
      return hierarchyClass(this).globalPropsFns = fns;
    }
    getRoot() {
      const priv = hierarchyClass(this);
      if (priv.isRoot) {
        return this;
      }
      return priv.parent.getRoot();
    }
    getRenderArgs(changeType) {
      const _this = this;
      let subtreePropsCache = null;
      let globalPropsCache = null;
      return assignAsGetter(super.getRenderArgs ? super.getRenderArgs(changeType) : {}, {
        get subtreeProps() {
          if (subtreePropsCache) {
            return subtreePropsCache;
          }
          return subtreePropsCache = createWatchable(_this.getSubTreeProps(), (listener) => {
            hierarchyClass(_this).subtreeChangeListeners.push(listener);
          });
        },
        get globalProps() {
          if (globalPropsCache) {
            return globalPropsCache;
          }
          return globalPropsCache = createWatchable(_this.globalProps().all, (listener) => {
            hierarchyClass(_this).globalPropertyChangeListeners.push(listener);
          });
        }
      });
    }
    runGlobalFunction(fn) {
      return hierarchyClass(this).propagateThroughTree(fn);
    }
    getParent() {
      return hierarchyClass(this).__getParent();
    }
    listenGP(event, listener, once = false) {
      this.listen(event, listener, once);
    }
  }
  const __typecheck__ = WebComponentHierarchyManager;
  __typecheck__;
  return WebComponentHierarchyManager;
};

// modules/wc-lib/lib/theme-manager.js
var noTheme = {};
var WebComponentThemeManagerMixin = (superFn) => {
  let currentThemeName = null;
  let fallbackThemeListeners = [];
  let themeListeners = [];
  function changeTheme(themeName) {
    currentThemeName = themeName;
    fallbackThemeListeners.forEach((l) => l(themeName));
    notifyChangedTheme(themeName);
  }
  function notifyChangedTheme(themeName) {
    const currentTheme = (() => {
      if (PrivateData.__theme && themeName && themeName in PrivateData.__theme) {
        return PrivateData.__theme[themeName];
      }
      return noTheme;
    })();
    themeListeners.forEach((l) => l(currentTheme));
  }
  class PrivateData {
    constructor(_self) {
      this._self = _self;
    }
    __setTheme() {
      this._self.renderToDOM(CHANGE_TYPE.THEME);
    }
  }
  PrivateData.__theme = null;
  PrivateData.__lastRenderedTheme = null;
  const privateMap = new WeakMap();
  function getPrivate(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new PrivateData(self)).get(self);
  }
  const componentThemeMap = new WeakMap();
  class WebComponentThemeManager extends superFn {
    constructor(...args) {
      super(...args);
      if (this.listenGP) {
        this.listenGP("globalPropChange", (prop) => {
          if (prop === "theme") {
            getPrivate(this).__setTheme();
          }
        });
      } else {
        fallbackThemeListeners.push(() => {
          getPrivate(this).__setTheme();
        });
      }
    }
    getThemeName() {
      return this.globalProps && this.globalProps().get("theme") || currentThemeName || PrivateData.__defaultTheme;
    }
    getTheme() {
      if (PrivateData.__theme) {
        const themeName = this.getThemeName();
        if (themeName && themeName in PrivateData.__theme) {
          return PrivateData.__theme[themeName];
        }
      }
      return noTheme;
    }
    setTheme(themeName) {
      if (this.globalProps) {
        this.globalProps().set("theme", themeName);
        notifyChangedTheme(themeName);
      } else {
        changeTheme(themeName);
      }
    }
    getRenderArgs(changeType) {
      const _this = this;
      let themeCache = null;
      return assignAsGetter(super.getRenderArgs ? super.getRenderArgs(changeType) : {}, {
        get theme() {
          if (themeCache)
            return themeCache;
          if (_this.getTheme) {
            return themeCache = createWatchable(_this.getTheme(), (listener) => {
              themeListeners.push(listener);
            });
          }
          return void 0;
        }
      });
    }
    static initTheme({theme, defaultTheme}) {
      PrivateData.__theme = theme;
      if (defaultTheme) {
        this.setDefaultTheme(defaultTheme);
      }
    }
    static setDefaultTheme(name) {
      PrivateData.__defaultTheme = name;
    }
    static __constructedCSSChanged(element) {
      if (!componentThemeMap.has(element.self)) {
        componentThemeMap.set(element.self, element.getThemeName());
        return true;
      }
      const theme = element.getThemeName();
      if (componentThemeMap.get(element.self) === theme) {
        return false;
      }
      componentThemeMap.set(element.self, theme);
      return true;
    }
  }
  const __typecheck__ = WebComponentThemeManager;
  __typecheck__;
  return WebComponentThemeManager;
};

// modules/wc-lib/lib/i18n-manager.js
var __awaiter2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var I18NClass = class {
  constructor(_self) {
    this._self = _self;
    this._elementLang = null;
  }
  setInitialLang() {
    this.setLang(I18NClass.__loadingLang, true);
  }
  notifyNewLang(lang) {
    return __awaiter2(this, void 0, void 0, function* () {
      for (const listener of I18NClass._listeners) {
        listener(lang);
      }
    });
  }
  setLang(lang, delayRender = false) {
    return __awaiter2(this, void 0, void 0, function* () {
      if (I18NClass.__loadingLang !== lang) {
        I18NClass.__loadingLang = lang;
        yield I18NClass.__loadLang(lang);
        if (I18NClass.__loadingLang === lang) {
          I18NClass.currentLang = lang;
        }
      } else {
        I18NClass.currentLang = lang;
      }
      if (this._elementLang !== lang) {
        this._elementLang = lang;
        if (delayRender) {
          setTimeout(() => {
            this._self.renderToDOM(CHANGE_TYPE.LANG);
            I18NClass.langChangeCompleteListeners.forEach((l) => {
              l(I18NClass.langFiles[I18NClass.lang]);
            });
          }, 0);
        } else {
          this._self.renderToDOM(CHANGE_TYPE.LANG);
          I18NClass.langChangeCompleteListeners.forEach((l) => l(I18NClass.langFiles[I18NClass.lang]));
        }
      }
    });
  }
  static notifyOnLangChange(listener) {
    this._listeners.push(listener);
    if (I18NClass.currentLang) {
      listener(I18NClass.currentLang);
    }
  }
  static __fetch(url) {
    return __awaiter2(this, void 0, void 0, function* () {
      if (typeof window !== "undefined" && "fetch" in window && typeof window.fetch !== void 0) {
        return window.fetch(url).then((r) => r.text());
      }
      return new Promise((resolve, reject) => {
        if (typeof XMLHttpRequest === "undefined") {
          resolve(null);
          return;
        }
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Failed xhr: ${xhr.status}`));
            }
          }
        };
        xhr.send();
      });
    });
  }
  static __loadLang(lang) {
    return __awaiter2(this, void 0, void 0, function* () {
      if (lang in this.__langPromises || lang in this.langFiles)
        return;
      const prom = new Promise((resolve) => __awaiter2(this, void 0, void 0, function* () {
        const text = yield this.__fetch(this.urlFormat.replace(/\$LANG\$/g, lang));
        if (!text) {
          resolve({});
          return;
        }
        resolve(JSON.parse(text));
      }));
      this.__langPromises[lang] = prom;
      this.langFiles[lang] = yield prom;
    });
  }
  static get lang() {
    return this.currentLang || this.__loadingLang || this.defaultLang;
  }
  static loadCurrentLang() {
    return __awaiter2(this, void 0, void 0, function* () {
      let loadingLang = this.lang;
      if (loadingLang in this.langFiles)
        return;
      if (loadingLang in this.__langPromises) {
        yield this.__langPromises[loadingLang];
        if (this.lang !== loadingLang)
          return this.loadCurrentLang();
        return;
      }
      this.__loadLang(loadingLang);
      yield this.__langPromises[loadingLang];
      if (this.lang !== loadingLang)
        return this.loadCurrentLang();
    });
  }
  static get isReady() {
    return this.lang in this.langFiles;
  }
  static waitForKey(key, values) {
    return __awaiter2(this, void 0, void 0, function* () {
      yield this.loadCurrentLang();
      return this.getMessage(this.langFiles[this.lang], key, values);
    });
  }
};
I18NClass.urlFormat = "/i18n/";
I18NClass.getMessage = (file, key) => {
  return file[key];
};
I18NClass.langFiles = {};
I18NClass.__langPromises = {};
I18NClass.__loadingLang = null;
I18NClass.currentLang = null;
I18NClass.defaultLang = null;
I18NClass.returner = (_, c) => c;
I18NClass._listeners = [];
I18NClass.langChangeCompleteListeners = [];
var WebComponentI18NManagerMixin = (superFn) => {
  const privateMap = new WeakMap();
  function i18nClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new I18NClass(self)).get(self);
  }
  class WebComponentI18NManagerClass extends superFn {
    constructor(...args) {
      super(...args);
      const priv = i18nClass(this);
      if (this.listenGP) {
        this.listenGP("globalPropChange", (prop, value) => {
          if (prop === "lang") {
            priv.setLang(value);
          }
        });
      } else {
        I18NClass.notifyOnLangChange((lang) => {
          priv.setLang(lang);
        });
      }
      priv.setInitialLang();
    }
    setLang(lang) {
      return __awaiter2(this, void 0, void 0, function* () {
        if (this.globalProps) {
          this.globalProps().set("lang", lang);
        } else {
          const priv = i18nClass(this);
          yield priv.setLang(lang);
          yield priv.notifyNewLang(lang);
        }
      });
    }
    getLang() {
      return I18NClass.lang;
    }
    static initI18N(config3) {
      const {defaultLang, getMessage, returner} = config3;
      if ("urlFormat" in config3) {
        I18NClass.urlFormat = config3.urlFormat;
      }
      if ("langFiles" in config3) {
        I18NClass.langFiles = config3.langFiles;
      }
      if (getMessage) {
        I18NClass.getMessage = getMessage;
      }
      if (returner) {
        I18NClass.returner = returner;
      }
      I18NClass.defaultLang = defaultLang;
    }
    __prom(key, ...values) {
      return WebComponentI18NManagerClass.__prom(key, ...values);
    }
    __(key, ...values) {
      return WebComponentI18NManagerClass.__(key, ...values);
    }
    static __prom(key, ...values) {
      return __awaiter2(this, void 0, void 0, function* () {
        if (I18NClass.isReady) {
          return I18NClass.getMessage(I18NClass.langFiles[I18NClass.lang], key, values);
        }
        return I18NClass.waitForKey(key, values);
      });
    }
    static __(key, ...values) {
      const value = this.__prom(key, ...values);
      return I18NClass.returner(value, `{{${key}}}`, (listener) => {
        I18NClass.langChangeCompleteListeners.push(() => {
          listener(this.__prom(key, ...values), `{{${key}}}`);
        });
      });
    }
    static get langReady() {
      return I18NClass.loadCurrentLang();
    }
  }
  const __typecheck__ = WebComponentI18NManagerClass;
  __typecheck__;
  return WebComponentI18NManagerClass;
};

// modules/wc-lib/lib/listener.js
var ListenableClass = class {
  constructor() {
    this.listenerMap = {};
  }
  __insertOnce(fns, listener) {
    const self = (...args) => {
      fns.delete(self);
      listener(...args);
    };
    fns.add(self);
  }
  __assertKeyExists(key, value) {
    if (!(key in value)) {
      value[key] = new Set();
    }
  }
  listen(event, listener, once) {
    this.__assertKeyExists(event, this.listenerMap);
    if (once) {
      this.__insertOnce(this.listenerMap[event], listener);
    } else {
      this.listenerMap[event].add(listener);
    }
  }
};
var WebComponentListenableMixin = (superFn) => {
  const privateMap = new WeakMap();
  function listenableClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new ListenableClass()).get(self);
  }
  class WebComponentListenable extends superFn {
    constructor(...args) {
      super(...args);
    }
    get listenerMap() {
      return listenableClass(this).listenerMap;
    }
    listen(event, listener, once = false) {
      listenableClass(this).listen(event, listener, once);
    }
    clearListener(event, listener) {
      if (event in this.listenerMap) {
        const eventListeners = this.listenerMap[event];
        if (!listener) {
          eventListeners.clear();
          return;
        }
        eventListeners.delete(listener);
      }
    }
    fire(event, ...params) {
      if (!(event in this.listenerMap)) {
        return [];
      }
      const set = this.listenerMap[event];
      const returnValues = [];
      for (const listener of set.values()) {
        returnValues.push(listener(...params));
      }
      return returnValues;
    }
  }
  const __typecheck__ = WebComponentListenable;
  __typecheck__;
  return WebComponentListenable;
};

// modules/wc-lib/lib/definer.js
var __awaiter3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function define(name, component) {
  if (typeof window === "undefined")
    return;
  if (window.customElements.get(name)) {
    return;
  }
  window.customElements.define(name, component);
}
var DefinerClass = class {
  constructor() {
    this.internals = {
      connectedHooks: [],
      postRenderHooks: []
    };
    this.isDevelopment = false;
  }
  static listenForFinished(component, isConstructed) {
    return __awaiter3(this, void 0, void 0, function* () {
      if (this.finished) {
        yield isConstructed;
        component.isMounted = true;
        component.mounted();
      } else {
        this.listeners.push({
          component,
          constructed: isConstructed
        });
      }
    });
  }
  setDevMode(component) {
    this.isDevelopment = DefinerClass.devComponents.indexOf(component.tagName.toLowerCase()) > -1;
  }
  static __doSingleMount(component) {
    return new Promise((resolve) => {
      const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
      animationFrame(() => {
        if (component.isMounted) {
          resolve();
          return;
        }
        component.isMounted = true;
        component.mounted();
        resolve();
      });
    });
  }
  static finishLoad() {
    return __awaiter3(this, void 0, void 0, function* () {
      this.finished = true;
      if (window.requestAnimationFrame || window.webkitRequestAnimationFrame) {
        for (const {component, constructed} of [...this.listeners]) {
          yield constructed;
          yield this.__doSingleMount(component);
        }
      } else {
        this.listeners.forEach(({constructed, component}) => __awaiter3(this, void 0, void 0, function* () {
          yield constructed;
          if (component.isMounted) {
            return;
          }
          component.isMounted = true;
          component.mounted();
        }));
      }
    });
  }
  static __isTemplate(value) {
    if (!value)
      return false;
    if (typeof value.changeOn !== "number" || typeof value.renderAsText !== "function" || typeof value.renderTemplate !== "function" || typeof value.renderSame !== "function" || typeof value.render !== "function" || typeof value.renderIfNew !== "function") {
      return false;
    }
    return true;
  }
  static checkProps(component) {
    if (!component.is) {
      throw new WCLibError(component, "Component is missing static is property");
    }
    if (typeof component.is !== "string") {
      throw new WCLibError(component, "Component name is not a string");
    }
    if (component.is.indexOf("-") === -1) {
      throw new WCLibError(component, 'Webcomponent names need to contain a dash "-"');
    }
    if (/[A-Z]/.test(component.is)) {
      throw new WCLibError(component, "Webcomponent names can not contain uppercase ASCII characters.");
    }
    if (/^\d/i.test(component.is)) {
      throw new WCLibError(component, "Webcomponent names can not start with a digit.");
    }
    if (/^-/i.test(component.is)) {
      throw new WCLibError(component, "Webcomponent names can not start with a hyphen.");
    }
    if (component.html === void 0) {
      throw new WCLibError(component, "Component is missing static html property (set to null to suppress)");
    }
    if (component.html === null) {
      component.html = new TemplateFn(null, CHANGE_TYPE.NEVER, null);
    } else if (!this.__isTemplate(component.html)) {
      throw new WCLibError(component, "Component's html template should be an instance of the TemplateFn class");
    }
    if (Array.isArray(component.css)) {
      for (const template of component.css) {
        if (!this.__isTemplate(template)) {
          throw new WCLibError(component, "Component's css template should be an instance of the TemplateFn class or an array of them");
        }
      }
    } else if (component.css !== null && component.css !== void 0 && !this.__isTemplate(component.css)) {
      throw new WCLibError(component, "Component's css template should be an instance of the TemplateFn class or an array of them");
    }
  }
};
DefinerClass.defined = [];
DefinerClass.devComponents = [];
DefinerClass.finished = false;
DefinerClass.listeners = [];
var DefineMetadata = class {
  static increment() {
    this.defined++;
    this._listeners.forEach((l) => l(this.defined));
  }
  static onDefine(listener) {
    this._listeners.push(listener);
  }
  static onReach(amount, listener) {
    this._listeners.push((currentAmount) => {
      if (currentAmount === amount) {
        listener(amount);
      }
    });
  }
};
DefineMetadata.defined = 0;
DefineMetadata._listeners = [];
var WebComponentDefinerMixin = (superFn) => {
  class WebComponentDefiner extends superFn {
    constructor(...args) {
      super(...args);
      this.___definerClass = new DefinerClass();
      const isConnected = new Promise((resolve) => {
        this.___definerClass.internals.connectedHooks.push(() => {
          resolve();
        });
      });
      DefinerClass.listenForFinished(this, isConnected);
      this.___definerClass.setDevMode(this);
    }
    static define(isDevelopment = false, isRoot = true) {
      if (isRoot && DefinerClass.finished) {
        DefinerClass.finished = false;
        DefinerClass.listeners = [];
      }
      if (isDevelopment) {
        DefinerClass.devComponents.push(this.is);
        DefinerClass.checkProps(this);
      }
      if (this.dependencies && this.dependencies.length) {
        for (const dependency of this.dependencies) {
          dependency && dependency.define(isDevelopment, false);
        }
      }
      define(this.is, this);
      DefinerClass.defined.push(this.is);
      DefineMetadata.increment();
      DefinerClass.finishLoad();
    }
  }
  WebComponentDefiner.dependencies = [];
  const __typecheck__ = WebComponentDefiner;
  __typecheck__;
  return WebComponentDefiner;
};

// modules/wc-lib/lib/listeners.js
var _supportsPassive = null;
function supportsPassive() {
  if (_supportsPassive !== null) {
    return _supportsPassive;
  }
  _supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, "passive", {
      get: function() {
        _supportsPassive = true;
      }
    });
    const tempFn = () => {
    };
    window.addEventListener("testPassive", tempFn, opts);
    window.removeEventListener("testPassive", tempFn, opts);
  } catch (e) {
  }
  return _supportsPassive;
}
var Listeners;
(function(Listeners3) {
  const listenedToElements = new WeakMap();
  function doListen(base, type, element, id, event, listener, options) {
    const boundListener = listener.bind(base);
    if (!listenedToElements.has(base)) {
      listenedToElements.set(base, {
        identifiers: new Map(),
        elements: new Map(),
        selfUnique: new Map(),
        self: new Map()
      });
    }
    const {elements: elementIDMap, identifiers: identifiersMap} = listenedToElements.get(base);
    const usedMap = type === "element" ? elementIDMap : identifiersMap;
    if (!usedMap.has(id)) {
      usedMap.set(id, {
        element,
        map: new Map()
      });
    }
    const {map: eventIDMap, element: listenedToElement} = usedMap.get(id);
    if (!eventIDMap.has(event)) {
      eventIDMap.set(event, boundListener);
    } else {
      listenedToElement.removeEventListener(event, eventIDMap.get(event));
    }
    if (listenedToElement !== element) {
      for (const listenedToEvent of eventIDMap.keys()) {
        listenedToElement.removeEventListener(listenedToEvent, eventIDMap.get(listenedToEvent));
        eventIDMap.delete(listenedToEvent);
      }
      usedMap.get(id).element = element;
    }
    if (options !== void 0 && options !== null && supportsPassive()) {
      element.addEventListener(event, boundListener, options);
    } else {
      element.addEventListener(event, boundListener);
    }
    return () => {
      if (eventIDMap.has(event) && eventIDMap.get(event) === boundListener) {
        listenedToElement.removeEventListener(event, boundListener);
        eventIDMap.delete(event);
      }
    };
  }
  function listen(base, id, event, listener, options) {
    const element = base.$[id];
    return doListen(base, "element", element, id, event, listener, options);
  }
  Listeners3.listen = listen;
  function listenWithIdentifier(base, element, identifier, event, listener, options) {
    return doListen(base, "identifier", element, identifier, event, listener, options);
  }
  Listeners3.listenWithIdentifier = listenWithIdentifier;
  const defaultContext = {};
  const usedElements = new WeakMap();
  function isNewElement(element, context = defaultContext) {
    if (!element)
      return false;
    if (!usedElements.has(context)) {
      usedElements.set(context, new WeakSet());
    }
    const currentContext = usedElements.get(context);
    const has = currentContext.has(element);
    if (!has) {
      currentContext.add(element);
    }
    return !has;
  }
  Listeners3.isNewElement = isNewElement;
  const newMap = new WeakMap();
  function listenIfNew(base, id, event, listener, isNew, options) {
    const element = base.$[id];
    const isElementNew = (() => {
      if (typeof isNew === "boolean") {
        return isNew;
      }
      if (!newMap.has(base)) {
        newMap.set(base, {});
      }
      return isNewElement(element, newMap.get(base));
    })();
    if (!isElementNew) {
      return () => {
      };
    }
    return listen(base, id, event, listener, options);
  }
  Listeners3.listenIfNew = listenIfNew;
  function listenToComponentUnique(base, event, listener) {
    const boundListener = listener.bind(base);
    if (!listenedToElements.has(base)) {
      listenedToElements.set(base, {
        identifiers: new Map(),
        elements: new Map(),
        selfUnique: new Map(),
        self: new Map()
      });
    }
    const {selfUnique: selfEventMap} = listenedToElements.get(base);
    if (!selfEventMap.has(event)) {
      selfEventMap.set(event, boundListener);
    } else {
      base.removeEventListener(event, selfEventMap.get(event));
    }
    base.addEventListener(event, boundListener);
    return () => {
      if (selfEventMap.has(event) && selfEventMap.get(event) === boundListener) {
        base.removeEventListener(event, selfEventMap.get(event));
        selfEventMap.delete(event);
      }
    };
  }
  Listeners3.listenToComponentUnique = listenToComponentUnique;
  function listenToComponent(base, event, listener) {
    const boundListener = listener.bind(base);
    if (!listenedToElements.has(base)) {
      listenedToElements.set(base, {
        identifiers: new Map(),
        elements: new Map(),
        selfUnique: new Map(),
        self: new Map()
      });
    }
    const {self: selfEventMap} = listenedToElements.get(base);
    if (!selfEventMap.has(event)) {
      selfEventMap.set(event, [boundListener]);
    } else {
      selfEventMap.get(event).push(boundListener);
    }
    base.addEventListener(event, boundListener);
    return () => {
      if (!selfEventMap.has(event))
        return;
      const listeners = selfEventMap.get(event);
      if (listeners.indexOf(boundListener) > -1) {
        base.removeEventListener(event, boundListener);
      }
      listeners.splice(listeners.indexOf(boundListener), 1);
      selfEventMap.set(event, listeners);
    };
  }
  Listeners3.listenToComponent = listenToComponent;
  function removeListeners(element, map) {
    for (const [event, listeners] of map.entries()) {
      for (const listener of Array.isArray(listeners) ? listeners : [listeners]) {
        element.removeEventListener(event, listener);
      }
    }
    map.clear();
  }
  function removeAllElementListeners(base) {
    if (!listenedToElements.has(base)) {
      return;
    }
    const {elements, identifiers, self, selfUnique} = listenedToElements.get(base);
    for (const {map, element} of elements.values()) {
      removeListeners(element, map);
    }
    elements.clear();
    for (const {map, element} of identifiers.values()) {
      removeListeners(element, map);
    }
    identifiers.clear();
    removeListeners(base, self);
    removeListeners(base, selfUnique);
  }
  Listeners3.removeAllElementListeners = removeAllElementListeners;
})(Listeners || (Listeners = {}));

// modules/wc-lib/lib/component.js
var __decorate4 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ComponentClass = class {
  constructor() {
    this.idMap = new Map();
    this.idMapProxy = null;
    this.supportsProxy = typeof Proxy !== "undefined";
  }
  clearMap() {
    this.idMap.clear();
  }
  genIdMapProxy(self) {
    const __this = this;
    return new Proxy((selector) => {
      return self.root.querySelector(selector);
    }, {
      get(_, id) {
        if (typeof id !== "string") {
          return void 0;
        }
        const cached = __this.idMap.get(id);
        if (cached && self.shadowRoot.contains(cached)) {
          return cached;
        }
        const el = self.root.getElementById(id);
        if (el) {
          __this.idMap.set(id, el);
        }
        return el || void 0;
      }
    });
  }
  getIdMapSnapshot(self) {
    const snapshot = (selector) => {
      return self.root.querySelector(selector);
    };
    for (const item of self.root.querySelectorAll("[id]")) {
      snapshot[item.id] = item;
    }
    return snapshot;
  }
};
__decorate4([
  bindToClass
], ComponentClass.prototype, "clearMap", null);
var WebComponentMixin = (superFn) => {
  const privateMap = new WeakMap();
  function getPrivate(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new ComponentClass()).get(self);
  }
  class WebComponent extends superFn {
    constructor(...args) {
      super(...args);
      this.disposables = [];
      this.isMounted = false;
      this.___definerClass.internals.postRenderHooks.push(getPrivate(this).clearMap);
    }
    get isSSR() {
      return false;
    }
    get $() {
      const priv = getPrivate(this);
      if (priv.supportsProxy) {
        return priv.idMapProxy || (priv.idMapProxy = priv.genIdMapProxy(this));
      }
      return priv.getIdMapSnapshot(this);
    }
    $$(selector) {
      return [...this.root.querySelectorAll(selector)];
    }
    connectedCallback() {
      super.connectedCallback();
      if (!this.self) {
        throw new WCLibError(this, "Missing .self property on component");
      }
      Props.onConnect(this);
      this.renderToDOM(CHANGE_TYPE.ALWAYS);
      this.layoutMounted();
      this.___definerClass.internals.connectedHooks.filter((fn) => fn());
    }
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      Listeners.removeAllElementListeners(this);
      this.disposables.forEach((disposable) => disposable());
      this.disposables = [];
      this.isMounted = false;
      this.unmounted();
    }
    layoutMounted() {
    }
    mounted() {
    }
    unmounted() {
    }
    listenProp(event, listener, once = false) {
      this.listen(event, listener, once);
    }
  }
  const __typecheck__ = WebComponent;
  __typecheck__;
  return WebComponent;
};

// modules/wc-lib/classes/parts.js
var FallbackHTMLElement = class {
  attachShadow(_init) {
    return {};
  }
  get tagName() {
    return "";
  }
  setAttribute() {
  }
  removeAttribute() {
  }
  hasAttribute() {
    return false;
  }
};
var elementBase = (() => {
  if (typeof HTMLElement !== "undefined") {
    return HTMLElement;
  } else {
    return process.HTMLElement || FallbackHTMLElement;
  }
})();

// modules/wc-lib/classes/full.js
var FullWebComponent = WebComponentMixin(WebComponentCustomCSSManagerMixin(WebComponentTemplateManagerMixin(WebComponentI18NManagerMixin(WebComponentThemeManagerMixin(WebComponentHierarchyManagerMixin(WebComponentListenableMixin(WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))))));

// modules/wc-lib/lib/configurable.js
var ConfigurableWebComponent = class extends FullWebComponent {
  get self() {
    return null;
  }
  getRenderArgs(changeType) {
    return super.getRenderArgs(changeType);
  }
};
function config(config3) {
  const {is, html: html3, description, css = [], mixins = [], dependencies = []} = config3;
  return (target) => {
    const targetComponent = target;
    class WebComponentConfig extends targetComponent {
      get self() {
        return WebComponentConfig;
      }
    }
    WebComponentConfig.is = is;
    WebComponentConfig.description = description;
    WebComponentConfig.dependencies = [
      ...targetComponent.dependencies || [],
      ...dependencies
    ].filter((dependency, index, arr) => arr.indexOf(dependency) === index);
    WebComponentConfig.mixins = mixins;
    WebComponentConfig.html = html3;
    WebComponentConfig.css = css || [];
    target.mixins = mixins;
    target.dependencies = dependencies;
    return WebComponentConfig;
  };
}

// ../node_modules/lit-html/lib/directive.js
var directives = new WeakMap();
var isDirective = (o) => {
  return typeof o === "function" && directives.has(o);
};

// ../node_modules/lit-html/lib/dom.js
var isCEPolyfill = typeof window !== "undefined" && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== void 0;
var removeNodes = (container, start, end = null) => {
  while (start !== end) {
    const n = start.nextSibling;
    container.removeChild(start);
    start = n;
  }
};

// ../node_modules/lit-html/lib/part.js
var noChange = {};
var nothing = {};

// ../node_modules/lit-html/lib/template.js
var marker = `{{lit-${String(Math.random()).slice(2)}}}`;
var nodeMarker = `<!--${marker}-->`;
var markerRegex = new RegExp(`${marker}|${nodeMarker}`);
var boundAttributeSuffix = "$lit$";
var Template = class {
  constructor(result, element) {
    this.parts = [];
    this.element = element;
    const nodesToRemove = [];
    const stack = [];
    const walker = document.createTreeWalker(element.content, 133, null, false);
    let lastPartIndex = 0;
    let index = -1;
    let partIndex = 0;
    const {strings, values: {length}} = result;
    while (partIndex < length) {
      const node = walker.nextNode();
      if (node === null) {
        walker.currentNode = stack.pop();
        continue;
      }
      index++;
      if (node.nodeType === 1) {
        if (node.hasAttributes()) {
          const attributes = node.attributes;
          const {length: length2} = attributes;
          let count = 0;
          for (let i = 0; i < length2; i++) {
            if (endsWith(attributes[i].name, boundAttributeSuffix)) {
              count++;
            }
          }
          while (count-- > 0) {
            const stringForPart = strings[partIndex];
            const name = lastAttributeNameRegex.exec(stringForPart)[2];
            const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
            const attributeValue = node.getAttribute(attributeLookupName);
            node.removeAttribute(attributeLookupName);
            const statics = attributeValue.split(markerRegex);
            this.parts.push({type: "attribute", index, name, strings: statics});
            partIndex += statics.length - 1;
          }
        }
        if (node.tagName === "TEMPLATE") {
          stack.push(node);
          walker.currentNode = node.content;
        }
      } else if (node.nodeType === 3) {
        const data = node.data;
        if (data.indexOf(marker) >= 0) {
          const parent = node.parentNode;
          const strings2 = data.split(markerRegex);
          const lastIndex = strings2.length - 1;
          for (let i = 0; i < lastIndex; i++) {
            let insert;
            let s = strings2[i];
            if (s === "") {
              insert = createMarker();
            } else {
              const match = lastAttributeNameRegex.exec(s);
              if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
              }
              insert = document.createTextNode(s);
            }
            parent.insertBefore(insert, node);
            this.parts.push({type: "node", index: ++index});
          }
          if (strings2[lastIndex] === "") {
            parent.insertBefore(createMarker(), node);
            nodesToRemove.push(node);
          } else {
            node.data = strings2[lastIndex];
          }
          partIndex += lastIndex;
        }
      } else if (node.nodeType === 8) {
        if (node.data === marker) {
          const parent = node.parentNode;
          if (node.previousSibling === null || index === lastPartIndex) {
            index++;
            parent.insertBefore(createMarker(), node);
          }
          lastPartIndex = index;
          this.parts.push({type: "node", index});
          if (node.nextSibling === null) {
            node.data = "";
          } else {
            nodesToRemove.push(node);
            index--;
          }
          partIndex++;
        } else {
          let i = -1;
          while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
            this.parts.push({type: "node", index: -1});
            partIndex++;
          }
        }
      }
    }
    for (const n of nodesToRemove) {
      n.parentNode.removeChild(n);
    }
  }
};
var endsWith = (str, suffix) => {
  const index = str.length - suffix.length;
  return index >= 0 && str.slice(index) === suffix;
};
var isTemplatePartActive = (part) => part.index !== -1;
var createMarker = () => document.createComment("");
var lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

// ../node_modules/lit-html/lib/template-instance.js
var TemplateInstance = class {
  constructor(template, processor, options) {
    this.__parts = [];
    this.template = template;
    this.processor = processor;
    this.options = options;
  }
  update(values) {
    let i = 0;
    for (const part of this.__parts) {
      if (part !== void 0) {
        part.setValue(values[i]);
      }
      i++;
    }
    for (const part of this.__parts) {
      if (part !== void 0) {
        part.commit();
      }
    }
  }
  _clone() {
    const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
    const stack = [];
    const parts2 = this.template.parts;
    const walker = document.createTreeWalker(fragment, 133, null, false);
    let partIndex = 0;
    let nodeIndex = 0;
    let part;
    let node = walker.nextNode();
    while (partIndex < parts2.length) {
      part = parts2[partIndex];
      if (!isTemplatePartActive(part)) {
        this.__parts.push(void 0);
        partIndex++;
        continue;
      }
      while (nodeIndex < part.index) {
        nodeIndex++;
        if (node.nodeName === "TEMPLATE") {
          stack.push(node);
          walker.currentNode = node.content;
        }
        if ((node = walker.nextNode()) === null) {
          walker.currentNode = stack.pop();
          node = walker.nextNode();
        }
      }
      if (part.type === "node") {
        const part2 = this.processor.handleTextExpression(this.options);
        part2.insertAfterNode(node.previousSibling);
        this.__parts.push(part2);
      } else {
        this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
      }
      partIndex++;
    }
    if (isCEPolyfill) {
      document.adoptNode(fragment);
      customElements.upgrade(fragment);
    }
    return fragment;
  }
};

// ../node_modules/lit-html/lib/template-result.js
var policy = window.trustedTypes && trustedTypes.createPolicy("lit-html", {createHTML: (s) => s});
var commentMarker = ` ${marker} `;
var TemplateResult = class {
  constructor(strings, values, type, processor) {
    this.strings = strings;
    this.values = values;
    this.type = type;
    this.processor = processor;
  }
  getHTML() {
    const l = this.strings.length - 1;
    let html3 = "";
    let isCommentBinding = false;
    for (let i = 0; i < l; i++) {
      const s = this.strings[i];
      const commentOpen = s.lastIndexOf("<!--");
      isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf("-->", commentOpen + 1) === -1;
      const attributeMatch = lastAttributeNameRegex.exec(s);
      if (attributeMatch === null) {
        html3 += s + (isCommentBinding ? commentMarker : nodeMarker);
      } else {
        html3 += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
      }
    }
    html3 += this.strings[l];
    return html3;
  }
  getTemplateElement() {
    const template = document.createElement("template");
    let value = this.getHTML();
    if (policy !== void 0) {
      value = policy.createHTML(value);
    }
    template.innerHTML = value;
    return template;
  }
};

// ../node_modules/lit-html/lib/parts.js
var isPrimitive = (value) => {
  return value === null || !(typeof value === "object" || typeof value === "function");
};
var isIterable = (value) => {
  return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};
var AttributeCommitter = class {
  constructor(element, name, strings) {
    this.dirty = true;
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.parts = [];
    for (let i = 0; i < strings.length - 1; i++) {
      this.parts[i] = this._createPart();
    }
  }
  _createPart() {
    return new AttributePart(this);
  }
  _getValue() {
    const strings = this.strings;
    const l = strings.length - 1;
    const parts2 = this.parts;
    if (l === 1 && strings[0] === "" && strings[1] === "") {
      const v = parts2[0].value;
      if (typeof v === "symbol") {
        return String(v);
      }
      if (typeof v === "string" || !isIterable(v)) {
        return v;
      }
    }
    let text = "";
    for (let i = 0; i < l; i++) {
      text += strings[i];
      const part = parts2[i];
      if (part !== void 0) {
        const v = part.value;
        if (isPrimitive(v) || !isIterable(v)) {
          text += typeof v === "string" ? v : String(v);
        } else {
          for (const t of v) {
            text += typeof t === "string" ? t : String(t);
          }
        }
      }
    }
    text += strings[l];
    return text;
  }
  commit() {
    if (this.dirty) {
      this.dirty = false;
      this.element.setAttribute(this.name, this._getValue());
    }
  }
};
var AttributePart = class {
  constructor(committer) {
    this.value = void 0;
    this.committer = committer;
  }
  setValue(value) {
    if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
      this.value = value;
      if (!isDirective(value)) {
        this.committer.dirty = true;
      }
    }
  }
  commit() {
    while (isDirective(this.value)) {
      const directive2 = this.value;
      this.value = noChange;
      directive2(this);
    }
    if (this.value === noChange) {
      return;
    }
    this.committer.commit();
  }
};
var NodePart = class {
  constructor(options) {
    this.value = void 0;
    this.__pendingValue = void 0;
    this.options = options;
  }
  appendInto(container) {
    this.startNode = container.appendChild(createMarker());
    this.endNode = container.appendChild(createMarker());
  }
  insertAfterNode(ref) {
    this.startNode = ref;
    this.endNode = ref.nextSibling;
  }
  appendIntoPart(part) {
    part.__insert(this.startNode = createMarker());
    part.__insert(this.endNode = createMarker());
  }
  insertAfterPart(ref) {
    ref.__insert(this.startNode = createMarker());
    this.endNode = ref.endNode;
    ref.endNode = this.startNode;
  }
  setValue(value) {
    this.__pendingValue = value;
  }
  commit() {
    if (this.startNode.parentNode === null) {
      return;
    }
    while (isDirective(this.__pendingValue)) {
      const directive2 = this.__pendingValue;
      this.__pendingValue = noChange;
      directive2(this);
    }
    const value = this.__pendingValue;
    if (value === noChange) {
      return;
    }
    if (isPrimitive(value)) {
      if (value !== this.value) {
        this.__commitText(value);
      }
    } else if (value instanceof TemplateResult) {
      this.__commitTemplateResult(value);
    } else if (value instanceof Node) {
      this.__commitNode(value);
    } else if (isIterable(value)) {
      this.__commitIterable(value);
    } else if (value === nothing) {
      this.value = nothing;
      this.clear();
    } else {
      this.__commitText(value);
    }
  }
  __insert(node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
  }
  __commitNode(value) {
    if (this.value === value) {
      return;
    }
    this.clear();
    this.__insert(value);
    this.value = value;
  }
  __commitText(value) {
    const node = this.startNode.nextSibling;
    value = value == null ? "" : value;
    const valueAsString = typeof value === "string" ? value : String(value);
    if (node === this.endNode.previousSibling && node.nodeType === 3) {
      node.data = valueAsString;
    } else {
      this.__commitNode(document.createTextNode(valueAsString));
    }
    this.value = value;
  }
  __commitTemplateResult(value) {
    const template = this.options.templateFactory(value);
    if (this.value instanceof TemplateInstance && this.value.template === template) {
      this.value.update(value.values);
    } else {
      const instance = new TemplateInstance(template, value.processor, this.options);
      const fragment = instance._clone();
      instance.update(value.values);
      this.__commitNode(fragment);
      this.value = instance;
    }
  }
  __commitIterable(value) {
    if (!Array.isArray(this.value)) {
      this.value = [];
      this.clear();
    }
    const itemParts = this.value;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      itemPart = itemParts[partIndex];
      if (itemPart === void 0) {
        itemPart = new NodePart(this.options);
        itemParts.push(itemPart);
        if (partIndex === 0) {
          itemPart.appendIntoPart(this);
        } else {
          itemPart.insertAfterPart(itemParts[partIndex - 1]);
        }
      }
      itemPart.setValue(item);
      itemPart.commit();
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      itemParts.length = partIndex;
      this.clear(itemPart && itemPart.endNode);
    }
  }
  clear(startNode = this.startNode) {
    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
  }
};
var BooleanAttributePart = class {
  constructor(element, name, strings) {
    this.value = void 0;
    this.__pendingValue = void 0;
    if (strings.length !== 2 || strings[0] !== "" || strings[1] !== "") {
      throw new Error("Boolean attributes can only contain a single expression");
    }
    this.element = element;
    this.name = name;
    this.strings = strings;
  }
  setValue(value) {
    this.__pendingValue = value;
  }
  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive2 = this.__pendingValue;
      this.__pendingValue = noChange;
      directive2(this);
    }
    if (this.__pendingValue === noChange) {
      return;
    }
    const value = !!this.__pendingValue;
    if (this.value !== value) {
      if (value) {
        this.element.setAttribute(this.name, "");
      } else {
        this.element.removeAttribute(this.name);
      }
      this.value = value;
    }
    this.__pendingValue = noChange;
  }
};
var PropertyCommitter = class extends AttributeCommitter {
  constructor(element, name, strings) {
    super(element, name, strings);
    this.single = strings.length === 2 && strings[0] === "" && strings[1] === "";
  }
  _createPart() {
    return new PropertyPart(this);
  }
  _getValue() {
    if (this.single) {
      return this.parts[0].value;
    }
    return super._getValue();
  }
  commit() {
    if (this.dirty) {
      this.dirty = false;
      this.element[this.name] = this._getValue();
    }
  }
};
var PropertyPart = class extends AttributePart {
};
var eventOptionsSupported = false;
(() => {
  try {
    const options = {
      get capture() {
        eventOptionsSupported = true;
        return false;
      }
    };
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (_e) {
  }
})();
var EventPart = class {
  constructor(element, eventName, eventContext) {
    this.value = void 0;
    this.__pendingValue = void 0;
    this.element = element;
    this.eventName = eventName;
    this.eventContext = eventContext;
    this.__boundHandleEvent = (e) => this.handleEvent(e);
  }
  setValue(value) {
    this.__pendingValue = value;
  }
  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive2 = this.__pendingValue;
      this.__pendingValue = noChange;
      directive2(this);
    }
    if (this.__pendingValue === noChange) {
      return;
    }
    const newListener = this.__pendingValue;
    const oldListener = this.value;
    const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
    const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }
    if (shouldAddListener) {
      this.__options = getOptions(newListener);
      this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }
    this.value = newListener;
    this.__pendingValue = noChange;
  }
  handleEvent(event) {
    if (typeof this.value === "function") {
      this.value.call(this.eventContext || this.element, event);
    } else {
      this.value.handleEvent(event);
    }
  }
};
var getOptions = (o) => o && (eventOptionsSupported ? {capture: o.capture, passive: o.passive, once: o.once} : o.capture);

// ../node_modules/lit-html/lib/default-template-processor.js
var DefaultTemplateProcessor = class {
  handleAttributeExpressions(element, name, strings, options) {
    const prefix = name[0];
    if (prefix === ".") {
      const committer2 = new PropertyCommitter(element, name.slice(1), strings);
      return committer2.parts;
    }
    if (prefix === "@") {
      return [new EventPart(element, name.slice(1), options.eventContext)];
    }
    if (prefix === "?") {
      return [new BooleanAttributePart(element, name.slice(1), strings)];
    }
    const committer = new AttributeCommitter(element, name, strings);
    return committer.parts;
  }
  handleTextExpression(options) {
    return new NodePart(options);
  }
};
var defaultTemplateProcessor = new DefaultTemplateProcessor();

// ../node_modules/lit-html/lib/template-factory.js
function templateFactory(result) {
  let templateCache = templateCaches.get(result.type);
  if (templateCache === void 0) {
    templateCache = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    };
    templateCaches.set(result.type, templateCache);
  }
  let template = templateCache.stringsArray.get(result.strings);
  if (template !== void 0) {
    return template;
  }
  const key = result.strings.join(marker);
  template = templateCache.keyString.get(key);
  if (template === void 0) {
    template = new Template(result, result.getTemplateElement());
    templateCache.keyString.set(key, template);
  }
  templateCache.stringsArray.set(result.strings, template);
  return template;
}
var templateCaches = new Map();

// ../node_modules/lit-html/lib/render.js
var parts = new WeakMap();
var render = (result, container, options) => {
  let part = parts.get(container);
  if (part === void 0) {
    removeNodes(container, container.firstChild);
    parts.set(container, part = new NodePart(Object.assign({templateFactory}, options)));
    part.appendInto(container);
  }
  part.setValue(result);
  part.commit();
};

// ../node_modules/lit-html/lit-html.js
if (typeof window !== "undefined") {
  (window["litHtmlVersions"] || (window["litHtmlVersions"] = [])).push("1.3.0");
}

// ../build/es/lib/enums.js
var CHANGE_TYPE2;
(function(CHANGE_TYPE3) {
  CHANGE_TYPE3[CHANGE_TYPE3["NEVER"] = 0] = "NEVER";
  CHANGE_TYPE3[CHANGE_TYPE3["MANUAL"] = 0] = "MANUAL";
  CHANGE_TYPE3[CHANGE_TYPE3["PROP"] = 1] = "PROP";
  CHANGE_TYPE3[CHANGE_TYPE3["THEME"] = 2] = "THEME";
  CHANGE_TYPE3[CHANGE_TYPE3["LANG"] = 4] = "LANG";
  CHANGE_TYPE3[CHANGE_TYPE3["SUBTREE_PROPS"] = 8] = "SUBTREE_PROPS";
  CHANGE_TYPE3[CHANGE_TYPE3["GLOBAL_PROPS"] = 16] = "GLOBAL_PROPS";
  CHANGE_TYPE3[CHANGE_TYPE3["ALWAYS"] = 63] = "ALWAYS";
  CHANGE_TYPE3[CHANGE_TYPE3["FORCE"] = 127] = "FORCE";
})(CHANGE_TYPE2 || (CHANGE_TYPE2 = {}));
var PROP_TYPE2;
(function(PROP_TYPE3) {
  PROP_TYPE3["STRING"] = "string";
  PROP_TYPE3["NUMBER"] = "number";
  PROP_TYPE3["BOOL"] = "bool";
  PROP_TYPE3["STRING_REQUIRED"] = "string_required";
  PROP_TYPE3["NUMBER_REQUIRED"] = "number_required";
  PROP_TYPE3["BOOL_REQUIRED"] = "bool_required";
  PROP_TYPE3["STRING_OPTIONAL"] = "string_optional";
  PROP_TYPE3["NUMBER_OPTIONAL"] = "number_optional";
  PROP_TYPE3["BOOL_OPTIONAL"] = "bool_optional";
})(PROP_TYPE2 || (PROP_TYPE2 = {}));

// ../build/es/lib/base.js
var __decorate5 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CUSTOM_CSS_PROP_NAME2 = "custom-css";
function repeat2(size) {
  return new Array(size).fill(0);
}
function makeArray2(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}
function bindToClass2(_target, propertyKey, descriptor) {
  if (!descriptor || typeof descriptor.value !== "function") {
    throw new TypeError(`Only methods can be decorated with @bind. <${propertyKey}> is not a method!`);
  }
  return {
    configurable: true,
    get() {
      const bound = descriptor.value.bind(this);
      Object.defineProperty(this, propertyKey, {
        value: bound,
        configurable: true,
        writable: true
      });
      return bound;
    }
  };
}
function assignAsGetter2(objectA, objectB, writable = false) {
  const returnObj = {};
  const bKeys = Object.keys(objectB);
  const aKeys = Object.keys(objectA).filter((k) => !bKeys.includes(k));
  for (const aKey of aKeys) {
    Object.defineProperty(returnObj, aKey, Object.assign({
      get() {
        return objectA[aKey];
      },
      enumerable: true
    }, writable ? {
      set(value) {
        objectA[aKey] = value;
      }
    } : {}));
  }
  for (const bKey of bKeys) {
    Object.defineProperty(returnObj, bKey, Object.assign({
      get() {
        return objectB[bKey];
      },
      enumerable: true
    }, writable ? {
      set(value) {
        objectB[bKey] = value;
      }
    } : {}));
  }
  return returnObj;
}
var BaseClassElementInstance2 = class {
  constructor() {
    this.___cssArr = null;
    this.___privateCSS = null;
    this.__cssSheets = null;
  }
};
var baseClassInstances2 = new Map();
var BaseClass2 = class {
  constructor(_self) {
    this._self = _self;
    this.disableRender = false;
    this.__firstRender = true;
    this.___renderContainers = null;
    this.__sheetsMounted = false;
    this.___canUseConstructedCSS = null;
  }
  get instance() {
    if (baseClassInstances2.has(this._self.self.is)) {
      return baseClassInstances2.get(this._self.self.is);
    }
    const classInstance = new BaseClassElementInstance2();
    baseClassInstances2.set(this._self.self.is, classInstance);
    return classInstance;
  }
  get __cssArr() {
    const instance = this.instance;
    if (instance.___cssArr !== null)
      return instance.___cssArr;
    return instance.___cssArr = makeArray2(this._self.self.css || []);
  }
  get __privateCSS() {
    const instance = this.instance;
    if (instance.___privateCSS !== null)
      return instance.___privateCSS;
    return instance.___privateCSS = this.canUseConstructedCSS ? this.__cssArr.filter((template) => {
      return !(template.changeOn === CHANGE_TYPE2.THEME || template.changeOn === CHANGE_TYPE2.NEVER);
    }) : this.__cssArr;
  }
  doPreRenderLifecycle() {
    this.disableRender = true;
    const retVal = this._self.preRender();
    this.disableRender = false;
    return retVal;
  }
  doPostRenderLifecycle() {
    this._self.___definerClass.internals.postRenderHooks.forEach((fn) => fn());
    if (this.__firstRender) {
      this.__firstRender = false;
      this._self.firstRender();
    }
    this._self.postRender();
  }
  __createFixtures() {
    const css = (() => {
      return this.__cssArr.map(() => {
        const el = document.createElement("span");
        el.setAttribute("data-type", "css");
        return el;
      });
    })();
    const customCSS = (() => {
      if (this._self.__hasCustomCSS()) {
        return repeat2(makeArray2(this._self.customCSS()).length).map(() => {
          const el = document.createElement("span");
          el.setAttribute("data-type", "custom-css");
          return el;
        });
      } else {
        return [];
      }
    })();
    const html3 = document.createElement("span");
    html3.setAttribute("data-type", "html");
    css.forEach((n) => this._self.root.appendChild(n));
    customCSS.forEach((n) => this._self.root.appendChild(n));
    this._self.root.appendChild(html3);
    return {
      css,
      customCSS,
      html: html3
    };
  }
  get renderContainers() {
    if (this.___renderContainers) {
      return this.___renderContainers;
    }
    return this.___renderContainers = this.__createFixtures();
  }
  __genConstructedCSS() {
    this.instance.__cssSheets = this.instance.__cssSheets || this.__cssArr.filter((template) => {
      return template.changeOn === CHANGE_TYPE2.THEME || template.changeOn === CHANGE_TYPE2.NEVER;
    }).map((t) => ({
      sheet: new CSSStyleSheet(),
      template: t
    }));
  }
  renderConstructedCSS(change) {
    if (!this.__cssArr.length)
      return;
    if (!this.__sheetsMounted) {
      this.__genConstructedCSS();
      if (this.instance.__cssSheets.length) {
        this._self.root.adoptedStyleSheets = this.instance.__cssSheets.map((s) => s.sheet);
        this.__sheetsMounted = true;
        change = CHANGE_TYPE2.ALWAYS;
      }
    }
    if (!(change & CHANGE_TYPE2.THEME)) {
      return;
    }
    if (!this._self.self.__constructedCSSChanged(this._self)) {
      return;
    }
    this.instance.__cssSheets.forEach(({sheet, template}) => {
      const rendered = template.renderAsText(change, this._self).replace(/<\/?style>/g, "");
      sheet.replaceSync(rendered);
    });
  }
  get canUseConstructedCSS() {
    if (this.___canUseConstructedCSS !== null) {
      return this.___canUseConstructedCSS;
    }
    return this.___canUseConstructedCSS = (() => {
      try {
        new CSSStyleSheet();
        return true;
      } catch (e) {
        return false;
      }
    })();
  }
  getRenderFn(template, change) {
    if (change === CHANGE_TYPE2.FORCE) {
      return template.render.bind(template);
    } else {
      return template.renderIfNew.bind(template);
    }
  }
};
BaseClass2.__constructedCSSRendered = false;
var WebComponentBaseMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function baseClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new BaseClass2(self)).get(self);
  }
  class WebComponentBase extends superFn {
    constructor() {
      super(...arguments);
      this.root = this.attachShadow({
        mode: "open"
      });
      this.props = {};
    }
    get self() {
      return null;
    }
    __hasCustomCSS() {
      return false;
    }
    customCSS() {
      return [];
    }
    static __constructedCSSChanged(_element) {
      if (BaseClass2.__constructedCSSRendered) {
        return false;
      }
      BaseClass2.__constructedCSSRendered = true;
      return true;
    }
    get jsxProps() {
      return this.props;
    }
    renderToDOM(change = CHANGE_TYPE2.FORCE) {
      const priv = baseClass(this);
      if (priv.disableRender)
        return;
      if (priv.doPreRenderLifecycle() === false) {
        return;
      }
      if (priv.canUseConstructedCSS) {
        priv.renderConstructedCSS(change);
      }
      priv.__privateCSS.forEach((sheet, index) => {
        priv.getRenderFn(sheet, change)(sheet.renderTemplate(change, this), priv.renderContainers.css[index]);
      });
      if (this.__hasCustomCSS()) {
        makeArray2(this.customCSS()).forEach((sheet, index) => {
          priv.getRenderFn(sheet, change)(sheet.renderTemplate(change, this), priv.renderContainers.customCSS[index]);
        });
      }
      if (this.self.html) {
        priv.getRenderFn(this.self.html, change)(this.self.html.renderTemplate(change, this), priv.renderContainers.html);
      }
      priv.doPostRenderLifecycle();
    }
    getRenderArgs(changeType) {
      const _this = this;
      return {
        get props() {
          return _this.props;
        },
        changeType
      };
    }
    preRender() {
    }
    postRender() {
    }
    firstRender() {
    }
    connectedCallback() {
    }
  }
  __decorate5([
    bindToClass2
  ], WebComponentBase.prototype, "renderToDOM", null);
  const __typecheck__ = WebComponentBase;
  __typecheck__;
  return WebComponentBase;
};

// ../build/es/lib/shared.js
function classNames2(...args) {
  var classes = [];
  for (const arg of args) {
    if (!arg && typeof arg !== "number")
      continue;
    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(arg);
    } else if (Array.isArray(arg) && arg.length) {
      var inner = classNames2.apply(null, arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (typeof arg === "object") {
      const objArg = arg;
      for (var key in objArg) {
        if (objArg[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(" ");
}
var WCLibError2 = class extends Error {
  constructor(component, message) {
    super(`${message} (see error.component)`);
    this.component = component;
  }
};

// ../build/es/lib/template-manager.js
var __decorate6 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClassAttributePart2 = class {
  constructor(element, name, strings, _config) {
    this.element = element;
    this.name = name;
    this.strings = strings;
    this._config = _config;
    this.value = void 0;
    this._pendingValue = void 0;
  }
  _isPrimitive(value) {
    return value === null || !(typeof value === "object" || typeof value === "function");
  }
  setValue(value) {
    if (value !== this._config.noChange && (!this._isPrimitive(value) || value !== this.value)) {
      this._pendingValue = value;
    }
  }
  _getClassNameString(args) {
    if (Array.isArray(args)) {
      return classNames2(...args);
    } else {
      return classNames2(args);
    }
  }
  commit() {
    while (this._config.isDirective(this._pendingValue)) {
      const directive2 = this._pendingValue;
      this._pendingValue = this._config.noChange;
      directive2(this);
    }
    if (this._pendingValue === this._config.noChange) {
      return;
    }
    if (typeof this._pendingValue === "string" || typeof this._pendingValue === "number") {
      this.value = this._pendingValue + "";
      this.element.setAttribute(this.name, this._pendingValue + "");
    } else {
      const classString = this._getClassNameString(this._pendingValue);
      this.element.setAttribute(this.name, classString);
    }
    this._pendingValue = this._config.noChange;
  }
};
var StyleAttributePart2 = class {
  constructor(element, name, strings, _config) {
    this.element = element;
    this.name = name;
    this.strings = strings;
    this._config = _config;
    this.value = void 0;
    this._pendingValue = void 0;
  }
  _isPrimitive(value) {
    return value === null || !(typeof value === "object" || typeof value === "function");
  }
  setValue(value) {
    if (value !== this._config.noChange && (!this._isPrimitive(value) || value !== this.value)) {
      this._pendingValue = value;
    }
  }
  static _toDashes(camelCase) {
    return camelCase.replace(/([a-z\d])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1-$2").toLowerCase();
  }
  static getStyleString(args) {
    const arr = [];
    for (const key in args) {
      arr.push(`${this._toDashes(key)}: ${args[key]};`);
    }
    return arr.join(" ");
  }
  commit() {
    while (this._config.isDirective(this._pendingValue)) {
      const directive2 = this._pendingValue;
      this._pendingValue = this._config.noChange;
      directive2(this);
    }
    if (this._pendingValue === this._config.noChange) {
      return;
    }
    if (typeof this._pendingValue === "string" || typeof this._pendingValue === "number") {
      this.value = this._pendingValue + "";
      this.element.setAttribute(this.name, this._pendingValue + "");
    } else {
      const styleString = StyleAttributePart2.getStyleString(this._pendingValue);
      this.element.setAttribute(this.name, styleString);
    }
    this._pendingValue = this._config.noChange;
  }
};
var ComplexValuePart2 = class {
  constructor(element, name, strings, genRef, _config) {
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.genRef = genRef;
    this._config = _config;
    this.value = void 0;
    this._pendingValue = void 0;
  }
  setValue(value) {
    if (value !== this._config.noChange && value !== this.value) {
      this._pendingValue = value;
    }
  }
  static __isTemplate(value) {
    if (!value)
      return false;
    if (typeof value.changeOn !== "number" || typeof value.renderAsText !== "function" || typeof value.renderTemplate !== "function" || typeof value.renderSame !== "function" || typeof value.render !== "function" || typeof value.renderIfNew !== "function") {
      return false;
    }
    return true;
  }
  commit() {
    while (this._config.isDirective(this._pendingValue)) {
      const directive2 = this._pendingValue;
      this._pendingValue = this._config.noChange;
      directive2(this);
    }
    if (this._pendingValue === this._config.noChange) {
      return;
    }
    if (this.name === CUSTOM_CSS_PROP_NAME2 && !ComplexValuePart2.__isTemplate(this._pendingValue)) {
      console.warn("Attempting to use non TemplateFn value for custom-css property");
      this._pendingValue = new TemplateFn2(null, CHANGE_TYPE2.NEVER, null);
    }
    let err = false;
    if (typeof this._pendingValue !== "string") {
      err = true;
    } else {
      try {
        JSON.parse(this._pendingValue);
        this.element.setAttribute(this.name, this._pendingValue);
      } catch (e) {
        err = true;
      }
    }
    if (err) {
      this.element.setAttribute(this.name, this.genRef(this._pendingValue));
    }
    this.value = this._pendingValue;
    this._pendingValue = this._config.noChange;
  }
};
function getComponentEventPart2(eventPart, config3) {
  return class ComponentEventPart extends eventPart {
    constructor(element, eventName, eventContext) {
      super(element, eventName, eventContext);
      this._pendingValue = void 0;
      this.element = element;
      this.eventName = eventName;
      this.eventContext = eventContext;
    }
    setValue(value) {
      this._pendingValue = value;
    }
    commit() {
      while (config3.isDirective(this._pendingValue)) {
        const directive2 = this._pendingValue;
        this._pendingValue = config3.noChange;
        directive2(this);
      }
      if (this._pendingValue === config3.noChange) {
        return;
      }
      const newListener = this._pendingValue;
      const oldListener = this.value;
      const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
      const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
      if (!("listen" in this.element) || !("clearListener" in this.element)) {
        console.warn("Attempting to listen using webcomponent listener on non-webcomponent element", `Name: ${this.eventName}, element:`, this.element);
      }
      if (shouldRemoveListener && "clearListener" in this.element && this.element.clearListener) {
        this.element.clearListener(this.eventName);
      }
      if (shouldAddListener && "listen" in this.element && this.element.listen) {
        this.element.listen(this.eventName, this.handleEvent.bind(this));
      }
      this.value = newListener;
      this._pendingValue = config3.noChange;
    }
    handleEvent(...args) {
      if (typeof this.value === "function") {
        return this.value.call(this.eventContext, ...args);
      } else {
        return this.value.handleEvent(...args);
      }
    }
  };
}
var ComplexTemplateProcessor2 = class {
  constructor(component, genRef, _config) {
    this.component = component;
    this.genRef = genRef;
    this._config = _config;
    this.__componentEventPart = null;
  }
  get _componentEventPart() {
    if (this.__componentEventPart !== null) {
      return this.__componentEventPart;
    }
    return this.__componentEventPart = getComponentEventPart2(this._config.EventPart, this._config);
  }
  _isComplexAttribute(element, name) {
    const propsComponent = element;
    if (!("props" in propsComponent) || !propsComponent.props)
      return false;
    const props = propsComponent.props;
    if (!props.__config)
      return false;
    const propsConfig = props.__config;
    const joined = Object.assign(Object.assign({}, propsConfig.reflect), propsConfig.priv);
    const propConfig = (() => {
      if (name in joined) {
        return getDefinePropConfig2(joined[name]);
      }
      const casingName = dashesToCasing2(name);
      if (casingName in joined) {
        return getDefinePropConfig2(joined[casingName]);
      }
      return null;
    })();
    if (propConfig === null)
      return false;
    return propConfig.type instanceof ComplexTypeClass2;
  }
  handleAttributeExpressions(element, name, strings) {
    const prefix = name[0];
    if (prefix === "@" || name.startsWith("on-")) {
      if (name[1] === "@" || name.startsWith("on--")) {
        return [
          new this._componentEventPart(element, name[1] === "@" ? name.slice(2) : name.slice("on--".length), this.component)
        ];
      } else {
        return [
          new this._config.EventPart(element, prefix === "@" ? name.slice(1) : name.slice("on-".length), this.component)
        ];
      }
    } else if (prefix === ".") {
      return new this._config.PropertyCommitter(element, name.slice(1), strings).parts;
    } else if (prefix === "?") {
      return [
        new this._config.BooleanAttributePart(element, name.slice(1), strings)
      ];
    } else if (name === "class") {
      return [
        new ClassAttributePart2(element, name, strings, this._config)
      ];
    } else if (name === "style") {
      return [
        new StyleAttributePart2(element, name, strings, this._config)
      ];
    } else if (prefix === "#" || name === CUSTOM_CSS_PROP_NAME2 || this._isComplexAttribute(element, name)) {
      if (prefix === "#") {
        name = name.slice(1);
      }
      return [
        new ComplexValuePart2(element, name, strings, this.genRef, this._config)
      ];
    }
    const committer = new this._config.AttributeCommitter(element, name, strings);
    return committer.parts;
  }
  handleTextExpression(options) {
    return new this._config.NodePart(options);
  }
};
var TemplateClass2 = class {
  constructor(_self) {
    this._self = _self;
    this.reffed = [];
    this._templateProcessor = null;
  }
  get templateProcessor() {
    if (this._templateProcessor !== null) {
      return this._templateProcessor;
    }
    return this._templateProcessor = new ComplexTemplateProcessor2(this._self, this.genRef, TemplateClass2._templateSettings);
  }
  static get templateResult() {
    if (!this._templateSettings) {
      console.warn("Missing templater, please initialize it by calling WebComponentTemplateManager.initComplexTemplateProvider({	TemplateResult: {{lit-html.TemplateResult}}	PropertyCommitter: {{lit-html.PropertyCommitter}}	EventPart: {{lit-html.EventPart}}	BooleanAttributePart: {{lit-html.BooleanAttributePart}}	AttributeCommitter: {{lit-html.AttributeCommitter}}	NodePart: {{lit-html.TemplateResult}}	isDirective: {{lit-html.isDirective}}	noChange: {{lit-html.noChange}}	directive: {{lit-html.directive}}})");
      return class X {
      };
    }
    return this._templateSettings.TemplateResult;
  }
  genRef(value) {
    if (this.reffed.indexOf(value) !== -1) {
      return `${refPrefix2}${this.reffed.indexOf(value)}`;
    }
    this.reffed.push(value);
    const refIndex = this.reffed.length - 1;
    return `${refPrefix2}${refIndex}`;
  }
};
TemplateClass2._templateSettings = null;
__decorate6([
  bindToClass2
], TemplateClass2.prototype, "genRef", null);
var WebComponentTemplateManagerMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function templateClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new TemplateClass2(self)).get(self);
  }
  class WebComponentTemplateManager extends superFn {
    generateHTMLTemplate(strings, ...values) {
      return new TemplateClass2.templateResult(strings, values, "html", templateClass(this).templateProcessor);
    }
    static initComplexTemplateProvider(config3) {
      TemplateClass2._templateSettings = config3;
    }
    getRef(ref) {
      if (typeof ref !== "string") {
        console.warn("Invalid ref", ref, "on", this);
        return void 0;
      }
      const refNumber = ~~ref.split(refPrefix2)[1];
      return templateClass(this).reffed[refNumber];
    }
    getParentRef(ref) {
      const parent = this.getParent();
      if (!parent) {
        console.warn("Could not find parent of", this, "and because of that could not find ref with id", ref);
        return void 0;
      }
      return parent.getRef(ref);
    }
    genRef(value) {
      return templateClass(this).genRef(value);
    }
  }
  __decorate6([
    bindToClass2
  ], WebComponentTemplateManager.prototype, "generateHTMLTemplate", null);
  const __typecheck__ = WebComponentTemplateManager;
  __typecheck__;
  return WebComponentTemplateManager;
};

// ../build/es/lib/util/manual.js
function createWatchable2(value, listen, writable) {
  return assignAsGetter2(value, {
    __watch(key, onChange) {
      listen((value2, changedKey) => {
        if (changedKey && changedKey !== key)
          return;
        onChange(value2[key]);
      });
    },
    __original: value
  }, writable);
}

// ../build/es/lib/props.js
var __awaiter4 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var refPrefix2 = "___complex_ref";
function getterWithVal2(component, value, strict, type) {
  if (type === "bool") {
    if (strict) {
      return value + "" === "true";
    }
    return value !== void 0 && value !== null && value !== "false";
  } else {
    if (value !== void 0 && value !== null && value !== "false") {
      if (type === "number") {
        return ~~value;
      } else if (type instanceof ComplexTypeClass2) {
        if (value.startsWith(refPrefix2)) {
          if (component.getParentRef) {
            return component.getParentRef(value);
          }
          return value;
        } else {
          try {
            return JSON.parse(decodeURIComponent(value));
          } catch (e) {
            console.warn("Failed to parse complex JSON value", decodeURIComponent(value));
            return void 0;
          }
        }
      }
      return value;
    }
    return void 0;
  }
}
function getter2(element, name, strict, type) {
  return getterWithVal2(element, element.getAttribute(name), strict, type);
}
function setter2(setAttrFn, removeAttrFn, name, value, type) {
  if (type === "bool") {
    const boolVal = value;
    if (boolVal) {
      setAttrFn(name, "");
    } else {
      removeAttrFn(name);
    }
  } else {
    const strVal = value;
    if (type instanceof ComplexTypeClass2) {
      try {
        setAttrFn(name, encodeURIComponent(JSON.stringify(strVal)));
      } catch (e) {
        setAttrFn(name, encodeURIComponent("_"));
      }
    } else {
      setAttrFn(name, String(strVal));
    }
  }
}
var NARROWED_PROP_TYPE2;
(function(NARROWED_PROP_TYPE3) {
  NARROWED_PROP_TYPE3["STRING"] = "string";
  NARROWED_PROP_TYPE3["NUMBER"] = "number";
  NARROWED_PROP_TYPE3["BOOL"] = "bool";
})(NARROWED_PROP_TYPE2 || (NARROWED_PROP_TYPE2 = {}));
var ComplexTypeClass2 = class {
  required() {
    return this;
  }
  optional() {
    return this;
  }
};
function getDefinePropConfig2(value) {
  if (typeof value === "object" && "type" in value) {
    const data = value;
    return data;
  } else {
    return {
      coerce: false,
      watch: true,
      strict: false,
      reflectToSelf: true,
      type: value
    };
  }
}
var Watching2;
(function(Watching3) {
  function genProxyStructureLevel(pathParts) {
    const currentLevel = new Map();
    for (const path of pathParts) {
      if (!currentLevel.has(path[0])) {
        currentLevel.set(path[0], {
          name: path[0],
          relevantPaths: [],
          watchCurrent: false,
          map: new Map()
        });
      }
      const currentLevelPath = currentLevel.get(path[0]);
      currentLevelPath.watchCurrent = currentLevelPath.watchCurrent || path.length === 1;
      currentLevelPath.relevantPaths.push(path);
    }
    for (const [name, level] of currentLevel) {
      if (name === "*") {
        for (const otherLevel of currentLevel.values()) {
          if (otherLevel.map === level.map)
            continue;
          otherLevel.relevantPaths.push(...level.relevantPaths);
        }
      }
    }
    for (const [, level] of currentLevel) {
      level.relevantPaths = level.relevantPaths.filter((val, index) => {
        return level.relevantPaths.indexOf(val) === index;
      });
    }
    for (const [, level] of currentLevel) {
      level.map = genProxyStructureLevel(level.relevantPaths.map((p) => p.slice(1)).filter((p) => p.length));
    }
    return currentLevel;
  }
  function getProxyStructure(paths) {
    const pathParts = paths.map((p) => p.split("."));
    for (const path of pathParts) {
      for (const pathPart of path) {
        if (pathPart === "**") {
          const retMap = new Map();
          retMap.set("**", {
            name: "**",
            map: new Map()
          });
          return retMap;
        }
      }
    }
    const structure = genProxyStructureLevel(pathParts);
    return structure;
  }
  function canWatchValue(value) {
    return typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp);
  }
  function createDeepProxy(obj, onAccessed) {
    const isArr = Array.isArray(obj);
    const proxy = new Proxy(obj, {
      set(_obj, prop, value) {
        const isPropChange = (() => {
          if (isArr) {
            if (typeof prop === "symbol")
              return true;
            if (typeof prop === "number" || !Number.isNaN(parseInt(prop))) {
              return true;
            }
            return false;
          } else {
            return true;
          }
        })();
        if (isPropChange) {
          const originalValue = value;
          if (canWatchValue(value) && value !== null) {
            value = createDeepProxy(value, onAccessed);
          }
          const oldValue = obj[prop];
          obj[prop] = value;
          if (oldValue !== originalValue) {
            onAccessed();
          }
        } else {
          obj[prop] = value;
        }
        return true;
      },
      deleteProperty(_obj, prop) {
        if (Reflect.has(obj, prop)) {
          const deleted = Reflect.deleteProperty(obj, prop);
          onAccessed();
          return deleted;
        }
        return true;
      }
    });
    for (const key of Object.keys(obj)) {
      if (canWatchValue(obj[key])) {
        obj[key] = createDeepProxy(obj[key], onAccessed);
      }
    }
    return proxy;
  }
  function watchObjectLevel(obj, level, onAccessed) {
    if (!obj)
      return obj;
    const isArr = Array.isArray(obj);
    const proxy = new Proxy(obj, {
      set(_obj, prop, value) {
        const isPropChange = (() => {
          if (isArr) {
            if (level.has("*")) {
              if (typeof prop === "symbol")
                return true;
              return typeof prop === "number" || !Number.isNaN(parseInt(prop));
            }
            if (typeof prop !== "symbol" && level.has(prop + "") && level.get(prop + "").watchCurrent) {
              return true;
            }
            return false;
          } else {
            if (typeof prop !== "symbol") {
              return level.get(prop + "") && level.get(prop + "").watchCurrent || level.get("*") && level.get("*").watchCurrent;
            }
            return level.has("*") && level.get("*").watchCurrent;
          }
        })();
        if (isPropChange) {
          const nextLevel = typeof prop !== "symbol" && level.get(prop + "") || level.get("*");
          if (nextLevel.map.size && canWatchValue(value)) {
            value = watchObjectLevel(value, nextLevel.map, onAccessed);
          }
          const accessProp = (() => {
            if (isArr) {
              if (typeof prop === "symbol")
                return prop;
              return parseInt(prop + "");
            } else {
              return prop;
            }
          })();
          const oldValue = obj[accessProp];
          obj[accessProp] = value;
          if (oldValue !== value) {
            onAccessed();
          }
        } else {
          obj[prop] = value;
        }
        return true;
      },
      deleteProperty(_obj, prop) {
        if (Reflect.has(obj, prop)) {
          const deleted = Reflect.deleteProperty(obj, prop);
          if (deleted && (typeof prop !== "symbol" && level.get(prop + "") && level.get(prop + "").watchCurrent || level.get("*") && level.get("*").watchCurrent)) {
            onAccessed();
          }
          return deleted;
        }
        return true;
      }
    });
    for (const name of Object.keys(obj)) {
      if ((level.has(name) || level.has("*")) && canWatchValue(obj[name])) {
        obj[name] = watchObjectLevel(obj[name], (level.get(name) || level.get("*")).map, onAccessed);
      }
    }
    return proxy;
  }
  function watchObject(obj, properties, callback) {
    if (typeof obj !== "object" || obj === void 0 || obj === null || typeof HTMLElement !== "undefined" && obj instanceof HTMLElement) {
      return obj;
    }
    if (typeof Proxy === "undefined") {
      console.warn("Attempted to watch object while proxy method is not supported");
      return obj;
    }
    if (properties.has("**")) {
      return createDeepProxy(obj, callback);
    } else {
      return watchObjectLevel(obj, properties, callback);
    }
  }
  function watchValue(render2, value, watch, watchProperties) {
    if (canWatchValue(value) && (watch || watchProperties.length > 0)) {
      value = watchObject(value, watchProperties.length ? getProxyStructure(watchProperties) : new Map([
        [
          "*",
          {
            name: "*",
            relevantPaths: [],
            watchCurrent: true,
            map: new Map()
          }
        ]
      ]), () => {
        render2(CHANGE_TYPE2.PROP);
      });
    }
    return value;
  }
  Watching3.watchValue = watchValue;
})(Watching2 || (Watching2 = {}));
var cachedCasing2 = new Map();
function dashesToCasing2(name) {
  const cached = cachedCasing2.get(name);
  if (cached) {
    return cached;
  }
  if (name.indexOf("-") === -1)
    return name;
  let newStr = "";
  for (let i = 0; i < name.length; i++) {
    if (name[i] === "-") {
      newStr += name[i + 1].toUpperCase();
      i++;
    } else {
      newStr += name[i];
    }
  }
  cachedCasing2.set(name, newStr);
  return newStr;
}
function casingToDashes2(name) {
  if (!/[A-Z]/.test(name))
    return name;
  let newStr = "";
  for (const char of name) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      newStr += "-" + char.toLowerCase();
    } else {
      newStr += char;
    }
  }
  return newStr;
}
function getNarrowedType2(propType) {
  switch (propType) {
    case PROP_TYPE2.STRING:
    case PROP_TYPE2.STRING_OPTIONAL:
    case PROP_TYPE2.STRING_REQUIRED:
      return NARROWED_PROP_TYPE2.STRING;
    case PROP_TYPE2.BOOL:
    case PROP_TYPE2.BOOL_OPTIONAL:
    case PROP_TYPE2.BOOL_REQUIRED:
      return NARROWED_PROP_TYPE2.BOOL;
    case PROP_TYPE2.NUMBER:
    case PROP_TYPE2.NUMBER_OPTIONAL:
    case PROP_TYPE2.NUMBER_REQUIRED:
      return NARROWED_PROP_TYPE2.NUMBER;
  }
  return propType;
}
function getCoerced2(initial, mapType) {
  switch (getNarrowedType2(mapType)) {
    case NARROWED_PROP_TYPE2.STRING:
      return initial || "";
    case NARROWED_PROP_TYPE2.BOOL:
      return initial || false;
    case NARROWED_PROP_TYPE2.NUMBER:
      return initial || 0;
  }
  return initial;
}
var connectMap2 = new WeakMap();
var connectedElements2 = new WeakSet();
function hookIntoConnect2(el, fn) {
  return __awaiter4(this, void 0, void 0, function* () {
    if (connectedElements2.has(el)) {
      fn();
      return;
    }
    yield new Promise((resolve) => __awaiter4(this, void 0, void 0, function* () {
      const arr = connectMap2.get(el) || [];
      arr.push(() => {
        fn();
        resolve();
      });
      connectMap2.set(el, arr);
    }));
  });
}
var PropsDefiner2;
(function(PropsDefiner3) {
  const renderMap = new WeakMap();
  function queueRender(element, changeType, changeKey) {
    if (!renderMap.has(element.component)) {
      renderMap.set(element.component, changeType);
    }
    setTimeout(() => {
      element.component.renderToDOM(renderMap.get(element.component));
      element.changeListeners.forEach((l) => l(changeKey));
      renderMap.delete(element.component);
    }, 0);
  }
  function createQueueRenderFn(element, changeKey) {
    return (changeType) => {
      queueRender(element, changeType, changeKey);
    };
  }
  class ElementRepresentation {
    constructor(component) {
      this.component = component;
      this.keyMap = new Map();
      this.propValues = {};
      this.onConnectMap = new Map();
      this.changeListeners = [];
      this.setAttr = component.setAttribute.bind(component);
      this.removeAttr = component.removeAttribute.bind(component);
      this.onDone = new Promise((resolve) => {
        this._onDoneResolve = resolve;
      });
    }
    overrideAttributeFunctions() {
      this.component.setAttribute = (key, val) => {
        if (!this.component.isMounted) {
          this.onConnect(dashesToCasing2(key), () => {
            onSetAttribute(key, val, this);
          }, true);
          this.setAttr(key, val);
          return;
        }
        onSetAttribute(key, val, this);
      };
      this.component.removeAttribute = (key) => {
        if (!this.component.isMounted) {
          this.onConnect(dashesToCasing2(key), () => {
            onRemoveAttribute(key, this);
          }, true);
          this.removeAttr(key);
          return;
        }
        onRemoveAttribute(key, this);
      };
    }
    onConnect(key, listener, force) {
      if (connectedElements2.has(this.component)) {
        listener();
        return;
      }
      if (this.onConnectMap.has(key) && !force)
        return;
      this.onConnectMap.set(key, listener);
    }
    connected() {
      [...this.onConnectMap.values()].forEach((listener) => {
        listener();
      });
      this._onDoneResolve();
      if (!this.component.isSSR) {
        queueRender(this, CHANGE_TYPE2.PROP);
      }
    }
  }
  function getKeys({reflect = {}, priv = {}}) {
    return [
      ...Object.getOwnPropertyNames(reflect).map((key) => {
        return {
          key,
          value: reflect[key],
          reflectToAttr: true
        };
      }),
      ...Object.getOwnPropertyNames(priv).map((key) => {
        return {
          key,
          value: priv[key],
          reflectToAttr: false
        };
      })
    ];
  }
  function onSetAttribute(key, val, el) {
    const casingKey = dashesToCasing2(key);
    if (el.keyMap.has(casingKey)) {
      const {watch, mapType, strict} = el.keyMap.get(casingKey);
      const prevVal = el.propValues[casingKey];
      const newVal = getterWithVal2(el.component, val, strict, getNarrowedType2(mapType));
      if (prevVal === newVal)
        return;
      el.component.fire("beforePropChange", casingKey, newVal, prevVal);
      el.propValues[casingKey] = newVal;
      el.component.fire("propChange", casingKey, newVal, prevVal);
      if (watch) {
        queueRender(el, CHANGE_TYPE2.PROP, casingKey);
      }
    } else {
      el.propValues[casingKey] = val;
    }
    el.setAttr(key, val);
  }
  function onRemoveAttribute(key, el) {
    const casingKey = dashesToCasing2(key);
    if (el.keyMap.has(casingKey)) {
      const {watch, coerce, mapType} = el.keyMap.get(casingKey);
      const prevVal = el.propValues[casingKey];
      const newVal = (() => {
        if (coerce) {
          return getCoerced2(void 0, mapType);
        }
        if (getNarrowedType2(mapType) === NARROWED_PROP_TYPE2.BOOL) {
          return false;
        }
        return void 0;
      })();
      if (prevVal !== newVal) {
        el.component.fire("beforePropChange", casingKey, newVal, prevVal);
        el.propValues[casingKey] = newVal;
        el.component.fire("propChange", casingKey, newVal, prevVal);
        el.changeListeners.forEach((l) => l(casingKey));
        if (watch) {
          queueRender(el, CHANGE_TYPE2.PROP, casingKey);
        }
      }
    }
    el.removeAttr(key);
  }
  const elementConfigs = new WeakMap();
  class Property {
    constructor(_propertyConfig, _rep, _props) {
      this._propertyConfig = _propertyConfig;
      this._rep = _rep;
      this._props = _props;
      this.__config = null;
    }
    __getConfig() {
      const {key, value, reflectToAttr} = this._propertyConfig;
      const mapKey = key;
      const propName = casingToDashes2(mapKey);
      const {watch = true, coerce = false, defaultValue, value: defaultValue2, type, strict = false, watchProperties = [], reflectToSelf = true, description} = getDefinePropConfig2(value);
      return {
        watch,
        coerce,
        type,
        strict,
        watchProperties,
        reflectToSelf,
        mapKey,
        key,
        reflectToAttr,
        propName,
        defaultValue: defaultValue !== void 0 ? defaultValue : defaultValue2,
        description: description || ""
      };
    }
    get config() {
      if (this.__config) {
        return this.__config;
      }
      return this.__config = this.__getConfig();
    }
    setKeyMap(keyMap) {
      const {key} = this._propertyConfig;
      const {watch, coerce, type: mapType, strict, reflectToAttr} = this.config;
      keyMap.set(key, {
        watch,
        coerce,
        mapType,
        strict,
        reflectToAttr
      });
    }
    _setReflect() {
      const _this = this;
      const {mapKey} = this.config;
      if (mapKey in this._rep.component)
        return;
      Object.defineProperty(this._rep.component, mapKey, {
        get() {
          return _this._rep.propValues[mapKey];
        },
        enumerable: true,
        set(value) {
          const props = _this._props;
          if (props[mapKey] === value)
            return;
          props[mapKey] = value;
        }
      });
    }
    setReflect() {
      const {reflectToSelf} = this.config;
      if (reflectToSelf) {
        this._setReflect();
      }
    }
    setPropAccessors() {
      const _this = this;
      const {mapKey, coerce, type, key, watch, watchProperties, propName} = this.config;
      Object.defineProperty(this._props, mapKey, {
        get() {
          const value = _this._rep.propValues[mapKey];
          if (coerce) {
            return getCoerced2(value, type);
          }
          return value;
        },
        enumerable: true,
        set(value) {
          const original = value;
          value = Watching2.watchValue(createQueueRenderFn(_this._rep, mapKey), value, watch, watchProperties);
          if (_this._props[mapKey] === value)
            return;
          const prevVal = _this._rep.propValues[mapKey];
          _this._rep.component.fire("beforePropChange", key, value, prevVal);
          _this._rep.propValues[mapKey] = value;
          _this._rep.component.fire("propChange", key, value, prevVal);
          _this._rep.changeListeners.forEach((l) => l(key));
          if (_this._propertyConfig.reflectToAttr) {
            setter2(_this._rep.setAttr, _this._rep.removeAttr, propName, original, getNarrowedType2(type));
          }
          if (watch) {
            queueRender(_this._rep, CHANGE_TYPE2.PROP, mapKey);
          }
        }
      });
    }
    assignComplexType() {
      return __awaiter4(this, void 0, void 0, function* () {
        const {type, mapKey, propName, strict, watch, watchProperties} = this.config;
        this._rep.onConnect(mapKey, () => {
          this._rep.propValues[mapKey] = Watching2.watchValue(createQueueRenderFn(this._rep, mapKey), this._rep.component.hasAttribute(propName) ? getter2(this._rep.component, propName, strict, getNarrowedType2(type)) : void 0, watch, watchProperties);
        }, false);
      });
    }
    assignSimpleType() {
      const {type, mapKey, propName, strict, watch, watchProperties} = this.config;
      this._rep.propValues[mapKey] = Watching2.watchValue(createQueueRenderFn(this._rep, mapKey), this._rep.component.hasAttribute(propName) || strict && type === "bool" ? getter2(this._rep.component, propName, strict, getNarrowedType2(type)) : void 0, watch, watchProperties);
    }
    doDefaultAssign() {
      const {defaultValue, mapKey, watch, watchProperties, propName, type, reflectToAttr} = this.config;
      if (defaultValue !== void 0) {
        if (this._rep.propValues[mapKey] === void 0) {
          this._rep.propValues[mapKey] = Watching2.watchValue(createQueueRenderFn(this._rep, mapKey), defaultValue, watch, watchProperties);
        }
        if (reflectToAttr) {
          setter2(this._rep.setAttr, this._rep.removeAttr, propName, this._rep.propValues[mapKey], type);
        }
      } else if (type instanceof ComplexTypeClass2 && reflectToAttr) {
        setter2(this._rep.setAttr, this._rep.removeAttr, propName, this._rep.propValues[mapKey], type);
      }
    }
  }
  function defineProperties(element, props, config3) {
    const keys = getKeys(config3);
    const properties = keys.map((key) => new Property(key, element, props));
    properties.forEach((property) => property.setKeyMap(element.keyMap));
    properties.forEach((property) => property.setReflect());
    properties.forEach((property) => property.setPropAccessors());
    return Promise.all(properties.map((property) => {
      if (!(property.config.type instanceof ComplexTypeClass2)) {
        property.assignSimpleType();
        element.onConnect(property.config.mapKey, () => {
          property.doDefaultAssign();
        }, false);
        return element.onDone;
      }
      element.onConnect(property.config.mapKey, () => {
        property.assignComplexType();
        property.doDefaultAssign();
      }, false);
      return element.onDone;
    }));
  }
  function define3(props, component, config3) {
    const element = new ElementRepresentation(component);
    element.overrideAttributeFunctions();
    if (component.isSSR) {
      element.connected();
      connectedElements2.add(component);
    } else {
      hookIntoConnect2(component, () => {
        element.connected();
      });
    }
    elementConfigs.set(props, {
      composite: false,
      element
    });
    return {
      awaitable: defineProperties(element, props, config3),
      addListener(changeListener) {
        element.changeListeners.push(changeListener);
      }
    };
  }
  PropsDefiner3.define = define3;
  function joinProps(previousProps, config3) {
    var _a, _b;
    if (!elementConfigs.has(previousProps)) {
      throw new Error("Previous props not defined");
    }
    const {element} = elementConfigs.get(previousProps);
    elementConfigs.set(previousProps, {
      composite: true,
      element
    });
    const joinedConfig = {};
    for (const key of ["reflect", "priv"]) {
      if (((_a = previousProps.__config) === null || _a === void 0 ? void 0 : _a[key]) || config3[key]) {
        joinedConfig[key] = Object.assign(Object.assign({}, (_b = previousProps.__config) === null || _b === void 0 ? void 0 : _b[key]), config3[key]);
      }
    }
    previousProps.__config = joinedConfig;
    return {
      awaitable: defineProperties(element, previousProps, config3),
      addListener(changeListener) {
        element.changeListeners.push(changeListener);
      }
    };
  }
  PropsDefiner3.joinProps = joinProps;
})(PropsDefiner2 || (PropsDefiner2 = {}));
var propConfigs2 = new Map();
var Props2 = class {
  constructor(__config) {
    this.__config = __config;
  }
  static define(element, config3 = {}, parentProps = element.props) {
    const tag = element.tagName.toLowerCase();
    if (propConfigs2.has(tag)) {
      propConfigs2.set(tag, Object.assign(Object.assign({}, propConfigs2.get(tag)), config3));
    } else {
      propConfigs2.set(tag, config3);
    }
    if (parentProps && !(typeof parentProps === "object" && Object.keys(parentProps).length === 0 && !(parentProps instanceof Props2))) {
      if (typeof parentProps === "object" && "__original" in parentProps) {
        parentProps = parentProps.__original;
      }
      if (typeof parentProps !== "object" || !(parentProps instanceof Props2)) {
        throw new Error("Parent props should be a Props object");
      }
      const {addListener: addListener2} = PropsDefiner2.joinProps(parentProps, config3);
      return createWatchable2(parentProps, (onChange) => {
        addListener2((changedKey) => {
          onChange(parentProps, changedKey);
        });
      }, true);
    }
    const props = new Props2(config3);
    const {addListener} = PropsDefiner2.define(props, element, config3);
    return createWatchable2(props, (onChange) => {
      addListener((changedKey) => {
        onChange(props, changedKey);
      });
    }, true);
  }
  static onConnect(element) {
    if (connectMap2.has(element)) {
      for (const listener of connectMap2.get(element)) {
        listener();
      }
    }
    connectedElements2.add(element);
  }
};

// ../build/es/lib/jsx-render.js
function convertSpecialAttrs2(attrs) {
  if (!attrs)
    return attrs;
  const specialAttrs = attrs;
  if (specialAttrs.__listeners || specialAttrs["@"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__listeners), specialAttrs["@"]);
    for (const key in specialProps) {
      attrs[`@${key}`] = specialProps[key];
    }
    delete specialAttrs.__listeners;
    delete specialAttrs["@"];
  }
  if (specialAttrs.__component_listeners || specialAttrs["@@"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__component_listeners), specialAttrs["@@"]);
    for (const key in specialProps) {
      attrs[`@@${key}`] = specialProps[key];
    }
    delete specialAttrs.__component_listeners;
    delete specialAttrs["@@"];
  }
  if (specialAttrs.__bools || specialAttrs["?"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__bools), specialAttrs["?"]);
    for (const key in specialProps) {
      attrs[`?${key}`] = specialProps[key];
    }
    delete specialAttrs.__bools;
    delete specialAttrs["?"];
  }
  if (specialAttrs.__refs || specialAttrs["#"]) {
    const specialProps = Object.assign(Object.assign({}, specialAttrs.__refs), specialAttrs["#"]);
    for (const key in specialProps) {
      attrs[`#${key}`] = specialProps[key];
    }
    delete specialAttrs.__refs;
    delete specialAttrs["#"];
  }
  return attrs;
}
var Fragment2 = Symbol("fragment");
var _Fragment2 = Fragment2;
var JSXDelayedExecutionCall2 = class {
  constructor(tag, attrs, children) {
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
  }
  collapse(templater) {
    let collapsed = jsxToLiteral2(this.tag, this.attrs, ...collapseDeeply2(this.children, templater));
    if (collapsed instanceof JSXDelayedExecutionCall2) {
      while (collapsed instanceof JSXDelayedExecutionCall2) {
        collapsed = collapsed.collapse(templater);
      }
      return collapsed;
    }
    const {strings, values} = collapsed;
    return templater(strings, ...values);
  }
};
function jsx2(tag, attrs, ...children) {
  return new JSXDelayedExecutionCall2(tag, attrs, children);
}
var _jsx2 = jsx2;
var html2;
(function(html3) {
  function jsx3(tag, attrs, ...children) {
    return _jsx2(tag, attrs, ...children);
  }
  html3.jsx = jsx3;
  function Fragment3() {
    return _Fragment2;
  }
  html3.Fragment = Fragment3;
  function F() {
    return _Fragment2;
  }
  html3.F = F;
})(html2 || (html2 = {}));
function isDefined2(name) {
  if (typeof window === "undefined" || !window.customElements)
    return true;
  if (window.customElements.get(name)) {
    return true;
  }
  return false;
}
function containsDelayedExecutions2(items, checked = new Set()) {
  return items.some((item) => {
    if (item instanceof JSXDelayedExecutionCall2) {
      return true;
    }
    const found = checked.has(item);
    checked.add(item);
    if (Array.isArray(item) && !found) {
      return containsDelayedExecutions2(item, checked);
    }
    return false;
  });
}
function collapseDeeply2(items, templater, checked = new Set()) {
  return items.map((item) => {
    if (item instanceof JSXDelayedExecutionCall2) {
      return item.collapse(templater);
    }
    const found = checked.has(item);
    checked.add(item);
    if (Array.isArray(item) && !found) {
      return collapseDeeply2(item, templater, checked);
    }
    return item;
  });
}
function jsxToLiteral2(tag, attrs, ...children) {
  var _a;
  if (containsDelayedExecutions2(children)) {
    return jsx2(tag, attrs, ...children);
  }
  let tagName;
  if (typeof tag === "string") {
    tagName = tag;
  } else if ((typeof tag === "object" || typeof tag === "function") && "is" in tag) {
    tagName = tag.is;
    if (!isDefined2(tag.is)) {
      (_a = tag.define) === null || _a === void 0 ? void 0 : _a.call(tag);
    }
  } else if (typeof tag === "function") {
    const returnValue = tag(attrs || {});
    if (returnValue !== _Fragment2) {
      return returnValue;
    }
    const filteredChildren2 = children.filter((child) => child !== false);
    const strings2 = new Array(filteredChildren2.length + 1).fill("");
    const stringsArr = strings2;
    stringsArr.raw = strings2;
    return {
      strings: stringsArr,
      values: filteredChildren2
    };
  } else {
    console.warn("Unknown tag value");
    return {strings: [], values: []};
  }
  const strings = [];
  const values = [];
  let openTagClosed = false;
  const newAttrs = convertSpecialAttrs2(attrs);
  const hasAttrs = !!(newAttrs && Object.getOwnPropertyNames(newAttrs).length);
  const filteredChildren = children.filter((child) => child !== false);
  const hasChildren = !!filteredChildren.length;
  if (!hasAttrs && !hasChildren) {
    strings.push(`<${tagName}></${tagName}>`);
    const arr2 = strings;
    arr2.raw = strings;
    return {
      strings: arr2,
      values
    };
  }
  if (hasAttrs) {
    let firstArg = true;
    for (const key in newAttrs) {
      const attrName = casingToDashes2(key);
      if (firstArg) {
        strings.push(`<${tagName} ${attrName}="`);
        firstArg = false;
      } else {
        strings.push(`" ${attrName}="`);
      }
      values.push(newAttrs[key]);
    }
  } else {
    strings.push(`<${tagName}>`);
    openTagClosed = true;
  }
  if (hasChildren) {
    for (const child of filteredChildren.slice(0, filteredChildren.length - 1)) {
      if (!openTagClosed) {
        strings.push(`">`);
        openTagClosed = true;
      }
      strings.push("");
      values.push(child);
    }
    values.push(filteredChildren[filteredChildren.length - 1]);
    if (!openTagClosed) {
      strings.push(`">`);
      openTagClosed = true;
    }
    strings.push(`</${tagName}>`);
  } else {
    strings.push(`"></${tagName}>`);
  }
  const arr = strings;
  arr.raw = strings;
  return {
    strings: arr,
    values
  };
}

// ../build/es/lib/template-fn.js
var changeTypes2 = new Set([1, 2, 4, 8, 16, 32]);
var templaterMap2 = new WeakMap();
var TemplateFn2 = class {
  constructor(_template, _changeOn, _renderer) {
    this._template = _template;
    this._changeOn = _changeOn;
    this._renderer = _renderer;
    this._lastRenderChanged = true;
  }
  get _changeOnAll() {
    return [...changeTypes2.values()].reduce((prev, current) => {
      return prev | current;
    }, 0);
  }
  get changeOn() {
    if (this._changeOn === CHANGE_TYPE2.ALWAYS) {
      return this._changeOnAll;
    }
    return this._changeOn;
  }
  _renderWithTemplater(changeType, component, templater) {
    if (!templater || typeof templater !== "object" && typeof templater !== "function") {
      templater = component;
    }
    if (!templaterMap2.has(templater)) {
      templaterMap2.set(templater, new WeakMap());
    }
    const componentTemplateMap = templaterMap2.get(templater);
    const jsxAddedTemplate = typeof templater === "function" ? templater.bind(component) : templater;
    jsxAddedTemplate.jsx = (tag, attrs, ...children) => {
      const jsxResult = jsxToLiteral2(tag, attrs, ...children);
      if (jsxResult instanceof JSXDelayedExecutionCall2)
        return jsxResult;
      const {strings, values} = jsxResult;
      return templater(strings, ...values);
    };
    jsxAddedTemplate.Fragment = jsxAddedTemplate.F = () => Fragment2;
    if (!componentTemplateMap.has(component)) {
      componentTemplateMap.set(component, new WeakMap());
    }
    const templateMap = componentTemplateMap.get(component);
    if (this.changeOn === CHANGE_TYPE2.NEVER) {
      const cached = templateMap.get(this);
      if (cached && changeType !== CHANGE_TYPE2.FORCE) {
        return {
          changed: false,
          rendered: cached
        };
      }
      let rendered = this._template === null ? null : this._template.call(component, jsxAddedTemplate, "getRenderArgs" in component && component.getRenderArgs ? component.getRenderArgs(changeType) : {});
      if (rendered instanceof JSXDelayedExecutionCall2) {
        rendered = rendered.collapse(templater);
      }
      templateMap.set(this, rendered);
      return {
        changed: true,
        rendered
      };
    }
    if (changeType === CHANGE_TYPE2.ALWAYS) {
      changeType = this._changeOnAll;
    }
    if (this.changeOn & changeType || !templateMap.has(this)) {
      let rendered = this._template.call(component, jsxAddedTemplate, "getRenderArgs" in component && component.getRenderArgs ? component.getRenderArgs(changeType) : {});
      if (rendered instanceof JSXDelayedExecutionCall2) {
        rendered = rendered.collapse(templater);
      }
      templateMap.set(this, rendered);
      return {
        changed: true,
        rendered
      };
    }
    return {
      changed: false,
      rendered: templateMap.get(this)
    };
  }
  static _textRenderer(strings, ...values) {
    const result = [strings[0]];
    for (let i = 0; i < values.length; i++) {
      result.push(values[i], strings[i + 1]);
    }
    return result.join("");
  }
  static _templateResultToText(result) {
    if (result === null || result === void 0)
      return "";
    if (typeof HTMLElement !== "undefined" && result instanceof HTMLElement || typeof Element !== "undefined" && result instanceof Element) {
      return `<${result.tagName.toLowerCase()} ${Array.from(result.attributes).map((attr) => {
        return `${attr.name}="${attr.value}"`;
      }).join(" ")}>${result.innerHTML}</${result.tagName.toLowerCase()}>`;
    }
    if ("toText" in result && typeof result.toText === "function") {
      return result.toText();
    }
    if ("strings" in result && "values" in result) {
      return this._textRenderer(result.strings, ...result.values);
    }
    throw new Error("Failed to convert template to text because there is no .toText() and no .strings and .values properties either (see TemplateRenderResult)");
  }
  renderAsText(changeType, component) {
    const {changed, rendered} = this._renderWithTemplater(changeType, component, TemplateFn2._textRenderer);
    this._lastRenderChanged = changed;
    if (typeof rendered !== "string") {
      return TemplateFn2._templateResultToText(rendered);
    }
    return rendered;
  }
  renderTemplate(changeType, component) {
    const {changed, rendered} = this._renderWithTemplater(changeType, component, component.generateHTMLTemplate);
    this._lastRenderChanged = changed;
    return rendered;
  }
  renderSame(changeType, component, templater) {
    const {changed, rendered} = this._renderWithTemplater(changeType, component, templater);
    this._lastRenderChanged = changed;
    return rendered;
  }
  render(template, target) {
    if (template === null)
      return;
    if (template instanceof HTMLElement || template instanceof Element) {
      target.appendChild(template);
      return;
    }
    if (this._renderer) {
      this._renderer(template, target);
    } else {
      throw new Error("Missing renderer");
    }
  }
  renderIfNew(template, target) {
    if (!this._lastRenderChanged)
      return;
    this.render(template, target);
  }
};

// ../build/es/lib/custom-css-manager.js
var CustomCSSClass2 = class {
  constructor(_self) {
    this._self = _self;
    this.hasCustomCSS = null;
    this.__noCustomCSS = new TemplateFn2(null, CHANGE_TYPE2.NEVER, null);
  }
  getCustomCSS() {
    if (!this._self.__hasCustomCSS()) {
      return this.__noCustomCSS;
    }
    return this._self.getParentRef(this._self.getAttribute(CUSTOM_CSS_PROP_NAME2));
  }
};
var WebComponentCustomCSSManagerMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function customCSSClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new CustomCSSClass2(self)).get(self);
  }
  class WebComponentCustomCSSManager extends superFn {
    constructor(...args) {
      super(...args);
      this.isMounted = false;
      const originalSetAttr = this.setAttribute;
      this.setAttribute = (key, val) => {
        originalSetAttr.bind(this)(key, val);
        if (key === CUSTOM_CSS_PROP_NAME2 && this.isMounted) {
          this.renderToDOM(CHANGE_TYPE2.ALWAYS);
        }
      };
    }
    __hasCustomCSS() {
      const priv = customCSSClass(this);
      if (priv.hasCustomCSS !== null) {
        return priv.hasCustomCSS;
      }
      if (!this.hasAttribute(CUSTOM_CSS_PROP_NAME2) || !this.getParentRef(this.getAttribute(CUSTOM_CSS_PROP_NAME2))) {
        if (this.isMounted) {
          priv.hasCustomCSS = false;
        }
        return false;
      }
      return priv.hasCustomCSS = true;
    }
    customCSS() {
      return customCSSClass(this).getCustomCSS();
    }
  }
  const __typecheck__ = WebComponentCustomCSSManager;
  __typecheck__;
  return WebComponentCustomCSSManager;
};

// ../build/es/lib/hierarchy-manager.js
var __decorate7 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HierarchyClass2 = class {
  constructor(_self, _getGetPrivate) {
    this._self = _self;
    this._getGetPrivate = _getGetPrivate;
    this.children = new Set();
    this.parent = null;
    this.globalProperties = {};
    this.isSubTreeRoot = false;
    this.subtreeProps = {};
    this.subtreeChangeListeners = [];
    this.globalPropertyChangeListeners = [];
    this.globalPropsFns = null;
  }
  __getParent() {
    return this.parent;
  }
  __isHierarchyManagerInstance(element) {
    return HierarchyClass2.hierarchyClasses.has(element);
  }
  getGlobalProperties() {
    const props = {};
    for (let i = 0; i < this._self.attributes.length; i++) {
      const attr = this._self.attributes[i];
      if (attr.name.startsWith("prop_")) {
        props[attr.name.slice("prop_".length)] = decodeURIComponent(attr.value);
      }
    }
    return props;
  }
  __findLocalRoot() {
    let element = this._self.parentNode;
    while (element && !(element instanceof window.ShadowRoot) && element !== document && !(element instanceof DocumentFragment)) {
      element = element.parentNode;
    }
    if (!element) {
      return null;
    }
    if (element === document) {
      return this._self;
    }
    const host = (() => {
      if (this.__isHierarchyManagerInstance(element)) {
        return element;
      } else {
        return element.host;
      }
    })();
    if (!this.__isHierarchyManagerInstance(host)) {
      return null;
    }
    return host;
  }
  findDirectParents(onNode) {
    onNode === null || onNode === void 0 ? void 0 : onNode(this._self);
    let element = this._self.parentNode;
    while (element && !(element instanceof window.ShadowRoot) && element !== document && !(element instanceof DocumentFragment) && !this.__isHierarchyManagerInstance(element)) {
      onNode === null || onNode === void 0 ? void 0 : onNode(element);
      element = element.parentNode;
    }
    element && (onNode === null || onNode === void 0 ? void 0 : onNode(element));
    if (!element) {
      return null;
    }
    if (element === document) {
      return this._self;
    } else {
      const host = this.__isHierarchyManagerInstance(element) ? element : element.host;
      if (!this.__isHierarchyManagerInstance(host)) {
        return null;
      }
      return host;
    }
  }
  __getRoot() {
    const localRoot = this.__findLocalRoot();
    if (localRoot !== null && localRoot !== this._self) {
      return localRoot;
    }
    return this.findDirectParents();
  }
  registerToParent() {
    const root = this.__getRoot();
    if (root === this._self) {
      this.isRoot = true;
      return;
    } else if (root === null) {
      return;
    }
    this.parent = root;
    const newProps = Object.assign({}, root.registerChild(this._self));
    for (const key in newProps) {
      this.setGlobalProperty(key, newProps[key], false);
    }
  }
  __subtreeChangeNotifyChildren() {
    this.__propagateDown((element) => {
      element.renderToDOM(CHANGE_TYPE2.SUBTREE_PROPS);
      const priv = this._getGetPrivate()(element);
      const listeners = priv.subtreeChangeListeners;
      if (listeners.length) {
        const subtreeValue = priv.getSubtreeProps();
        listeners.forEach((l) => l(subtreeValue));
      }
    }, []);
  }
  registerAsSubTreeRoot(props) {
    this.isSubTreeRoot = true;
    this.subtreeProps = props;
    this.__subtreeChangeNotifyChildren();
  }
  setSubTreeProps(props) {
    if (!this.isSubTreeRoot) {
      throw new Error("Can't set subtree props if node has not been registered as a subtree yet. Call this.registerAsSubTreeRoot(props) first");
    }
    this.isSubTreeRoot = true;
    this.subtreeProps = props;
    this.__subtreeChangeNotifyChildren();
  }
  clearNonExistentChildren() {
    const nodeChildren = Array.prototype.slice.apply(this._self.children);
    for (const child of this.children.values()) {
      if (!this._self.shadowRoot.contains(child) && !nodeChildren.filter((nodeChild) => nodeChild.contains(child)).length) {
        this.children.delete(child);
      }
    }
  }
  setGlobalProperty(key, value, doRender = true) {
    if (this.globalProperties[key] !== value) {
      const oldVal = this.globalProperties[key];
      this.globalProperties[key] = value;
      this._self.fire("globalPropChange", key, value, oldVal);
      this.globalPropertyChangeListeners.forEach((l) => l(this.globalProperties, key));
      if (doRender) {
        this._self.renderToDOM(CHANGE_TYPE2.GLOBAL_PROPS);
      }
    }
  }
  propagateThroughTree(fn) {
    if (this.isRoot) {
      const results = [];
      this.__propagateDown(fn, results);
      return results;
    } else if (this.parent) {
      return this._getGetPrivate()(this.parent).propagateThroughTree(fn);
    } else {
      return [];
    }
  }
  __propagateDown(fn, results) {
    results.push(fn(this._self));
    for (const child of this.children) {
      this._getGetPrivate()(child).__propagateDown(fn, results);
    }
  }
  __getAllInPathToRoot() {
    const allNodes = [];
    let prevNode = null;
    let resultingNode = this._self;
    do {
      prevNode = resultingNode;
      resultingNode = this._getGetPrivate()(resultingNode).findDirectParents((node) => {
        allNodes.push(node);
      });
    } while (resultingNode !== null && prevNode && resultingNode !== prevNode);
    return allNodes.filter((value, index, arr) => arr.indexOf(value) === index);
  }
  getSubtreeRoots() {
    const nodes = this.__getAllInPathToRoot();
    return nodes.filter((node) => {
      return this._getGetPrivate()(node).isSubTreeRoot;
    }).reverse();
  }
  getSubtreeProps() {
    return this.getSubtreeRoots().reduce((prev, current) => {
      return Object.assign(Object.assign({}, prev), this._getGetPrivate()(current).subtreeProps);
    }, {});
  }
};
HierarchyClass2.hierarchyClasses = new WeakSet();
__decorate7([
  bindToClass2
], HierarchyClass2.prototype, "registerToParent", null);
var WebComponentHierarchyManagerMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function hierarchyClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new HierarchyClass2(self, () => hierarchyClass)).get(self);
  }
  class WebComponentHierarchyManager extends superFn {
    constructor(...args) {
      super(...args);
      HierarchyClass2.hierarchyClasses.add(this);
    }
    connectedCallback() {
      super.connectedCallback();
      const priv = hierarchyClass(this);
      priv.isRoot = this.hasAttribute("_root");
      priv.globalProperties = {};
      priv.registerToParent();
      if (priv.isRoot) {
        priv.globalProperties = Object.assign({}, priv.getGlobalProperties());
      }
    }
    registerChild(element) {
      const priv = hierarchyClass(this);
      priv.clearNonExistentChildren();
      priv.children.add(element);
      return priv.globalProperties;
    }
    registerAsSubTreeRoot(props = {}) {
      const priv = hierarchyClass(this);
      priv.registerAsSubTreeRoot(props);
    }
    setSubTreeProps(props) {
      const priv = hierarchyClass(this);
      priv.setSubTreeProps(props);
    }
    getSubtreeRoots() {
      const priv = hierarchyClass(this);
      return priv.getSubtreeRoots();
    }
    getSubTreeProps() {
      return hierarchyClass(this).getSubtreeProps();
    }
    globalProps() {
      const priv = hierarchyClass(this);
      if (priv.globalPropsFns) {
        return priv.globalPropsFns;
      }
      const __this = this;
      const fns = {
        get all() {
          return hierarchyClass(__this).globalProperties;
        },
        get(key) {
          if (!hierarchyClass(__this).globalProperties) {
            return void 0;
          }
          return hierarchyClass(__this).globalProperties[key];
        },
        set(key, value) {
          if (!hierarchyClass(__this).parent && !hierarchyClass(__this).isRoot) {
            console.warn(`Failed to propagate global property "${key}" since this element has no registered parent`);
            return;
          }
          hierarchyClass(__this).propagateThroughTree((element) => {
            hierarchyClass(element).setGlobalProperty(key, value);
          });
        }
      };
      return hierarchyClass(this).globalPropsFns = fns;
    }
    getRoot() {
      const priv = hierarchyClass(this);
      if (priv.isRoot) {
        return this;
      }
      return priv.parent.getRoot();
    }
    getRenderArgs(changeType) {
      const _this = this;
      let subtreePropsCache = null;
      let globalPropsCache = null;
      return assignAsGetter2(super.getRenderArgs ? super.getRenderArgs(changeType) : {}, {
        get subtreeProps() {
          if (subtreePropsCache) {
            return subtreePropsCache;
          }
          return subtreePropsCache = createWatchable2(_this.getSubTreeProps(), (listener) => {
            hierarchyClass(_this).subtreeChangeListeners.push(listener);
          });
        },
        get globalProps() {
          if (globalPropsCache) {
            return globalPropsCache;
          }
          return globalPropsCache = createWatchable2(_this.globalProps().all, (listener) => {
            hierarchyClass(_this).globalPropertyChangeListeners.push(listener);
          });
        }
      });
    }
    runGlobalFunction(fn) {
      return hierarchyClass(this).propagateThroughTree(fn);
    }
    getParent() {
      return hierarchyClass(this).__getParent();
    }
    listenGP(event, listener, once = false) {
      this.listen(event, listener, once);
    }
  }
  const __typecheck__ = WebComponentHierarchyManager;
  __typecheck__;
  return WebComponentHierarchyManager;
};

// ../build/es/lib/theme-manager.js
var noTheme2 = {};
var WebComponentThemeManagerMixin2 = (superFn) => {
  let currentThemeName = null;
  let fallbackThemeListeners = [];
  let themeListeners = [];
  function changeTheme(themeName) {
    currentThemeName = themeName;
    fallbackThemeListeners.forEach((l) => l(themeName));
    notifyChangedTheme(themeName);
  }
  function notifyChangedTheme(themeName) {
    const currentTheme = (() => {
      if (PrivateData.__theme && themeName && themeName in PrivateData.__theme) {
        return PrivateData.__theme[themeName];
      }
      return noTheme2;
    })();
    themeListeners.forEach((l) => l(currentTheme));
  }
  class PrivateData {
    constructor(_self) {
      this._self = _self;
    }
    __setTheme() {
      this._self.renderToDOM(CHANGE_TYPE2.THEME);
    }
  }
  PrivateData.__theme = null;
  PrivateData.__lastRenderedTheme = null;
  const privateMap = new WeakMap();
  function getPrivate(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new PrivateData(self)).get(self);
  }
  const componentThemeMap = new WeakMap();
  class WebComponentThemeManager extends superFn {
    constructor(...args) {
      super(...args);
      if (this.listenGP) {
        this.listenGP("globalPropChange", (prop) => {
          if (prop === "theme") {
            getPrivate(this).__setTheme();
          }
        });
      } else {
        fallbackThemeListeners.push(() => {
          getPrivate(this).__setTheme();
        });
      }
    }
    getThemeName() {
      return this.globalProps && this.globalProps().get("theme") || currentThemeName || PrivateData.__defaultTheme;
    }
    getTheme() {
      if (PrivateData.__theme) {
        const themeName = this.getThemeName();
        if (themeName && themeName in PrivateData.__theme) {
          return PrivateData.__theme[themeName];
        }
      }
      return noTheme2;
    }
    setTheme(themeName) {
      if (this.globalProps) {
        this.globalProps().set("theme", themeName);
        notifyChangedTheme(themeName);
      } else {
        changeTheme(themeName);
      }
    }
    getRenderArgs(changeType) {
      const _this = this;
      let themeCache = null;
      return assignAsGetter2(super.getRenderArgs ? super.getRenderArgs(changeType) : {}, {
        get theme() {
          if (themeCache)
            return themeCache;
          if (_this.getTheme) {
            return themeCache = createWatchable2(_this.getTheme(), (listener) => {
              themeListeners.push(listener);
            });
          }
          return void 0;
        }
      });
    }
    static initTheme({theme, defaultTheme}) {
      PrivateData.__theme = theme;
      if (defaultTheme) {
        this.setDefaultTheme(defaultTheme);
      }
    }
    static setDefaultTheme(name) {
      PrivateData.__defaultTheme = name;
    }
    static __constructedCSSChanged(element) {
      if (!componentThemeMap.has(element.self)) {
        componentThemeMap.set(element.self, element.getThemeName());
        return true;
      }
      const theme = element.getThemeName();
      if (componentThemeMap.get(element.self) === theme) {
        return false;
      }
      componentThemeMap.set(element.self, theme);
      return true;
    }
  }
  const __typecheck__ = WebComponentThemeManager;
  __typecheck__;
  return WebComponentThemeManager;
};

// ../build/es/lib/i18n-manager.js
var __awaiter5 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var I18NClass2 = class {
  constructor(_self) {
    this._self = _self;
    this._elementLang = null;
  }
  setInitialLang() {
    this.setLang(I18NClass2.__loadingLang, true);
  }
  notifyNewLang(lang) {
    return __awaiter5(this, void 0, void 0, function* () {
      for (const listener of I18NClass2._listeners) {
        listener(lang);
      }
    });
  }
  setLang(lang, delayRender = false) {
    return __awaiter5(this, void 0, void 0, function* () {
      if (I18NClass2.__loadingLang !== lang) {
        I18NClass2.__loadingLang = lang;
        yield I18NClass2.__loadLang(lang);
        if (I18NClass2.__loadingLang === lang) {
          I18NClass2.currentLang = lang;
        }
      } else {
        I18NClass2.currentLang = lang;
      }
      if (this._elementLang !== lang) {
        this._elementLang = lang;
        if (delayRender) {
          setTimeout(() => {
            this._self.renderToDOM(CHANGE_TYPE2.LANG);
            I18NClass2.langChangeCompleteListeners.forEach((l) => {
              l(I18NClass2.langFiles[I18NClass2.lang]);
            });
          }, 0);
        } else {
          this._self.renderToDOM(CHANGE_TYPE2.LANG);
          I18NClass2.langChangeCompleteListeners.forEach((l) => l(I18NClass2.langFiles[I18NClass2.lang]));
        }
      }
    });
  }
  static notifyOnLangChange(listener) {
    this._listeners.push(listener);
    if (I18NClass2.currentLang) {
      listener(I18NClass2.currentLang);
    }
  }
  static __fetch(url) {
    return __awaiter5(this, void 0, void 0, function* () {
      if (typeof window !== "undefined" && "fetch" in window && typeof window.fetch !== void 0) {
        return window.fetch(url).then((r) => r.text());
      }
      return new Promise((resolve, reject) => {
        if (typeof XMLHttpRequest === "undefined") {
          resolve(null);
          return;
        }
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Failed xhr: ${xhr.status}`));
            }
          }
        };
        xhr.send();
      });
    });
  }
  static __loadLang(lang) {
    return __awaiter5(this, void 0, void 0, function* () {
      if (lang in this.__langPromises || lang in this.langFiles)
        return;
      const prom = new Promise((resolve) => __awaiter5(this, void 0, void 0, function* () {
        const text = yield this.__fetch(this.urlFormat.replace(/\$LANG\$/g, lang));
        if (!text) {
          resolve({});
          return;
        }
        resolve(JSON.parse(text));
      }));
      this.__langPromises[lang] = prom;
      this.langFiles[lang] = yield prom;
    });
  }
  static get lang() {
    return this.currentLang || this.__loadingLang || this.defaultLang;
  }
  static loadCurrentLang() {
    return __awaiter5(this, void 0, void 0, function* () {
      let loadingLang = this.lang;
      if (loadingLang in this.langFiles)
        return;
      if (loadingLang in this.__langPromises) {
        yield this.__langPromises[loadingLang];
        if (this.lang !== loadingLang)
          return this.loadCurrentLang();
        return;
      }
      this.__loadLang(loadingLang);
      yield this.__langPromises[loadingLang];
      if (this.lang !== loadingLang)
        return this.loadCurrentLang();
    });
  }
  static get isReady() {
    return this.lang in this.langFiles;
  }
  static waitForKey(key, values) {
    return __awaiter5(this, void 0, void 0, function* () {
      yield this.loadCurrentLang();
      return this.getMessage(this.langFiles[this.lang], key, values);
    });
  }
};
I18NClass2.urlFormat = "/i18n/";
I18NClass2.getMessage = (file, key) => {
  return file[key];
};
I18NClass2.langFiles = {};
I18NClass2.__langPromises = {};
I18NClass2.__loadingLang = null;
I18NClass2.currentLang = null;
I18NClass2.defaultLang = null;
I18NClass2.returner = (_, c) => c;
I18NClass2._listeners = [];
I18NClass2.langChangeCompleteListeners = [];
var WebComponentI18NManagerMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function i18nClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new I18NClass2(self)).get(self);
  }
  class WebComponentI18NManagerClass extends superFn {
    constructor(...args) {
      super(...args);
      const priv = i18nClass(this);
      if (this.listenGP) {
        this.listenGP("globalPropChange", (prop, value) => {
          if (prop === "lang") {
            priv.setLang(value);
          }
        });
      } else {
        I18NClass2.notifyOnLangChange((lang) => {
          priv.setLang(lang);
        });
      }
      priv.setInitialLang();
    }
    setLang(lang) {
      return __awaiter5(this, void 0, void 0, function* () {
        if (this.globalProps) {
          this.globalProps().set("lang", lang);
        } else {
          const priv = i18nClass(this);
          yield priv.setLang(lang);
          yield priv.notifyNewLang(lang);
        }
      });
    }
    getLang() {
      return I18NClass2.lang;
    }
    static initI18N(config3) {
      const {defaultLang, getMessage, returner} = config3;
      if ("urlFormat" in config3) {
        I18NClass2.urlFormat = config3.urlFormat;
      }
      if ("langFiles" in config3) {
        I18NClass2.langFiles = config3.langFiles;
      }
      if (getMessage) {
        I18NClass2.getMessage = getMessage;
      }
      if (returner) {
        I18NClass2.returner = returner;
      }
      I18NClass2.defaultLang = defaultLang;
    }
    __prom(key, ...values) {
      return WebComponentI18NManagerClass.__prom(key, ...values);
    }
    __(key, ...values) {
      return WebComponentI18NManagerClass.__(key, ...values);
    }
    static __prom(key, ...values) {
      return __awaiter5(this, void 0, void 0, function* () {
        if (I18NClass2.isReady) {
          return I18NClass2.getMessage(I18NClass2.langFiles[I18NClass2.lang], key, values);
        }
        return I18NClass2.waitForKey(key, values);
      });
    }
    static __(key, ...values) {
      const value = this.__prom(key, ...values);
      return I18NClass2.returner(value, `{{${key}}}`, (listener) => {
        I18NClass2.langChangeCompleteListeners.push(() => {
          listener(this.__prom(key, ...values), `{{${key}}}`);
        });
      });
    }
    static get langReady() {
      return I18NClass2.loadCurrentLang();
    }
  }
  const __typecheck__ = WebComponentI18NManagerClass;
  __typecheck__;
  return WebComponentI18NManagerClass;
};

// ../build/es/lib/listener.js
var ListenableClass2 = class {
  constructor() {
    this.listenerMap = {};
  }
  __insertOnce(fns, listener) {
    const self = (...args) => {
      fns.delete(self);
      listener(...args);
    };
    fns.add(self);
  }
  __assertKeyExists(key, value) {
    if (!(key in value)) {
      value[key] = new Set();
    }
  }
  listen(event, listener, once) {
    this.__assertKeyExists(event, this.listenerMap);
    if (once) {
      this.__insertOnce(this.listenerMap[event], listener);
    } else {
      this.listenerMap[event].add(listener);
    }
  }
};
var WebComponentListenableMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function listenableClass(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new ListenableClass2()).get(self);
  }
  class WebComponentListenable extends superFn {
    constructor(...args) {
      super(...args);
    }
    get listenerMap() {
      return listenableClass(this).listenerMap;
    }
    listen(event, listener, once = false) {
      listenableClass(this).listen(event, listener, once);
    }
    clearListener(event, listener) {
      if (event in this.listenerMap) {
        const eventListeners = this.listenerMap[event];
        if (!listener) {
          eventListeners.clear();
          return;
        }
        eventListeners.delete(listener);
      }
    }
    fire(event, ...params) {
      if (!(event in this.listenerMap)) {
        return [];
      }
      const set = this.listenerMap[event];
      const returnValues = [];
      for (const listener of set.values()) {
        returnValues.push(listener(...params));
      }
      return returnValues;
    }
  }
  const __typecheck__ = WebComponentListenable;
  __typecheck__;
  return WebComponentListenable;
};

// ../build/es/lib/definer.js
var __awaiter6 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function define2(name, component) {
  if (typeof window === "undefined")
    return;
  if (window.customElements.get(name)) {
    return;
  }
  window.customElements.define(name, component);
}
var DefinerClass2 = class {
  constructor() {
    this.internals = {
      connectedHooks: [],
      postRenderHooks: []
    };
    this.isDevelopment = false;
  }
  static listenForFinished(component, isConstructed) {
    return __awaiter6(this, void 0, void 0, function* () {
      if (this.finished) {
        yield isConstructed;
        component.isMounted = true;
        component.mounted();
      } else {
        this.listeners.push({
          component,
          constructed: isConstructed
        });
      }
    });
  }
  setDevMode(component) {
    this.isDevelopment = DefinerClass2.devComponents.indexOf(component.tagName.toLowerCase()) > -1;
  }
  static __doSingleMount(component) {
    return new Promise((resolve) => {
      const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
      animationFrame(() => {
        if (component.isMounted) {
          resolve();
          return;
        }
        component.isMounted = true;
        component.mounted();
        resolve();
      });
    });
  }
  static finishLoad() {
    return __awaiter6(this, void 0, void 0, function* () {
      this.finished = true;
      if (window.requestAnimationFrame || window.webkitRequestAnimationFrame) {
        for (const {component, constructed} of [...this.listeners]) {
          yield constructed;
          yield this.__doSingleMount(component);
        }
      } else {
        this.listeners.forEach(({constructed, component}) => __awaiter6(this, void 0, void 0, function* () {
          yield constructed;
          if (component.isMounted) {
            return;
          }
          component.isMounted = true;
          component.mounted();
        }));
      }
    });
  }
  static __isTemplate(value) {
    if (!value)
      return false;
    if (typeof value.changeOn !== "number" || typeof value.renderAsText !== "function" || typeof value.renderTemplate !== "function" || typeof value.renderSame !== "function" || typeof value.render !== "function" || typeof value.renderIfNew !== "function") {
      return false;
    }
    return true;
  }
  static checkProps(component) {
    if (!component.is) {
      throw new WCLibError2(component, "Component is missing static is property");
    }
    if (typeof component.is !== "string") {
      throw new WCLibError2(component, "Component name is not a string");
    }
    if (component.is.indexOf("-") === -1) {
      throw new WCLibError2(component, 'Webcomponent names need to contain a dash "-"');
    }
    if (/[A-Z]/.test(component.is)) {
      throw new WCLibError2(component, "Webcomponent names can not contain uppercase ASCII characters.");
    }
    if (/^\d/i.test(component.is)) {
      throw new WCLibError2(component, "Webcomponent names can not start with a digit.");
    }
    if (/^-/i.test(component.is)) {
      throw new WCLibError2(component, "Webcomponent names can not start with a hyphen.");
    }
    if (component.html === void 0) {
      throw new WCLibError2(component, "Component is missing static html property (set to null to suppress)");
    }
    if (component.html === null) {
      component.html = new TemplateFn2(null, CHANGE_TYPE2.NEVER, null);
    } else if (!this.__isTemplate(component.html)) {
      throw new WCLibError2(component, "Component's html template should be an instance of the TemplateFn class");
    }
    if (Array.isArray(component.css)) {
      for (const template of component.css) {
        if (!this.__isTemplate(template)) {
          throw new WCLibError2(component, "Component's css template should be an instance of the TemplateFn class or an array of them");
        }
      }
    } else if (component.css !== null && component.css !== void 0 && !this.__isTemplate(component.css)) {
      throw new WCLibError2(component, "Component's css template should be an instance of the TemplateFn class or an array of them");
    }
  }
};
DefinerClass2.defined = [];
DefinerClass2.devComponents = [];
DefinerClass2.finished = false;
DefinerClass2.listeners = [];
var DefineMetadata2 = class {
  static increment() {
    this.defined++;
    this._listeners.forEach((l) => l(this.defined));
  }
  static onDefine(listener) {
    this._listeners.push(listener);
  }
  static onReach(amount, listener) {
    this._listeners.push((currentAmount) => {
      if (currentAmount === amount) {
        listener(amount);
      }
    });
  }
};
DefineMetadata2.defined = 0;
DefineMetadata2._listeners = [];
var WebComponentDefinerMixin2 = (superFn) => {
  class WebComponentDefiner extends superFn {
    constructor(...args) {
      super(...args);
      this.___definerClass = new DefinerClass2();
      const isConnected = new Promise((resolve) => {
        this.___definerClass.internals.connectedHooks.push(() => {
          resolve();
        });
      });
      DefinerClass2.listenForFinished(this, isConnected);
      this.___definerClass.setDevMode(this);
    }
    static define(isDevelopment = false, isRoot = true) {
      if (isRoot && DefinerClass2.finished) {
        DefinerClass2.finished = false;
        DefinerClass2.listeners = [];
      }
      if (isDevelopment) {
        DefinerClass2.devComponents.push(this.is);
        DefinerClass2.checkProps(this);
      }
      if (this.dependencies && this.dependencies.length) {
        for (const dependency of this.dependencies) {
          dependency && dependency.define(isDevelopment, false);
        }
      }
      define2(this.is, this);
      DefinerClass2.defined.push(this.is);
      DefineMetadata2.increment();
      DefinerClass2.finishLoad();
    }
  }
  WebComponentDefiner.dependencies = [];
  const __typecheck__ = WebComponentDefiner;
  __typecheck__;
  return WebComponentDefiner;
};

// ../build/es/lib/listeners.js
var _supportsPassive2 = null;
function supportsPassive2() {
  if (_supportsPassive2 !== null) {
    return _supportsPassive2;
  }
  _supportsPassive2 = false;
  try {
    var opts = Object.defineProperty({}, "passive", {
      get: function() {
        _supportsPassive2 = true;
      }
    });
    const tempFn = () => {
    };
    window.addEventListener("testPassive", tempFn, opts);
    window.removeEventListener("testPassive", tempFn, opts);
  } catch (e) {
  }
  return _supportsPassive2;
}
var Listeners2;
(function(Listeners3) {
  const listenedToElements = new WeakMap();
  function doListen(base, type, element, id, event, listener, options) {
    const boundListener = listener.bind(base);
    if (!listenedToElements.has(base)) {
      listenedToElements.set(base, {
        identifiers: new Map(),
        elements: new Map(),
        selfUnique: new Map(),
        self: new Map()
      });
    }
    const {elements: elementIDMap, identifiers: identifiersMap} = listenedToElements.get(base);
    const usedMap = type === "element" ? elementIDMap : identifiersMap;
    if (!usedMap.has(id)) {
      usedMap.set(id, {
        element,
        map: new Map()
      });
    }
    const {map: eventIDMap, element: listenedToElement} = usedMap.get(id);
    if (!eventIDMap.has(event)) {
      eventIDMap.set(event, boundListener);
    } else {
      listenedToElement.removeEventListener(event, eventIDMap.get(event));
    }
    if (listenedToElement !== element) {
      for (const listenedToEvent of eventIDMap.keys()) {
        listenedToElement.removeEventListener(listenedToEvent, eventIDMap.get(listenedToEvent));
        eventIDMap.delete(listenedToEvent);
      }
      usedMap.get(id).element = element;
    }
    if (options !== void 0 && options !== null && supportsPassive2()) {
      element.addEventListener(event, boundListener, options);
    } else {
      element.addEventListener(event, boundListener);
    }
    return () => {
      if (eventIDMap.has(event) && eventIDMap.get(event) === boundListener) {
        listenedToElement.removeEventListener(event, boundListener);
        eventIDMap.delete(event);
      }
    };
  }
  function listen(base, id, event, listener, options) {
    const element = base.$[id];
    return doListen(base, "element", element, id, event, listener, options);
  }
  Listeners3.listen = listen;
  function listenWithIdentifier(base, element, identifier, event, listener, options) {
    return doListen(base, "identifier", element, identifier, event, listener, options);
  }
  Listeners3.listenWithIdentifier = listenWithIdentifier;
  const defaultContext = {};
  const usedElements = new WeakMap();
  function isNewElement(element, context = defaultContext) {
    if (!element)
      return false;
    if (!usedElements.has(context)) {
      usedElements.set(context, new WeakSet());
    }
    const currentContext = usedElements.get(context);
    const has = currentContext.has(element);
    if (!has) {
      currentContext.add(element);
    }
    return !has;
  }
  Listeners3.isNewElement = isNewElement;
  const newMap = new WeakMap();
  function listenIfNew(base, id, event, listener, isNew, options) {
    const element = base.$[id];
    const isElementNew = (() => {
      if (typeof isNew === "boolean") {
        return isNew;
      }
      if (!newMap.has(base)) {
        newMap.set(base, {});
      }
      return isNewElement(element, newMap.get(base));
    })();
    if (!isElementNew) {
      return () => {
      };
    }
    return listen(base, id, event, listener, options);
  }
  Listeners3.listenIfNew = listenIfNew;
  function listenToComponentUnique(base, event, listener) {
    const boundListener = listener.bind(base);
    if (!listenedToElements.has(base)) {
      listenedToElements.set(base, {
        identifiers: new Map(),
        elements: new Map(),
        selfUnique: new Map(),
        self: new Map()
      });
    }
    const {selfUnique: selfEventMap} = listenedToElements.get(base);
    if (!selfEventMap.has(event)) {
      selfEventMap.set(event, boundListener);
    } else {
      base.removeEventListener(event, selfEventMap.get(event));
    }
    base.addEventListener(event, boundListener);
    return () => {
      if (selfEventMap.has(event) && selfEventMap.get(event) === boundListener) {
        base.removeEventListener(event, selfEventMap.get(event));
        selfEventMap.delete(event);
      }
    };
  }
  Listeners3.listenToComponentUnique = listenToComponentUnique;
  function listenToComponent(base, event, listener) {
    const boundListener = listener.bind(base);
    if (!listenedToElements.has(base)) {
      listenedToElements.set(base, {
        identifiers: new Map(),
        elements: new Map(),
        selfUnique: new Map(),
        self: new Map()
      });
    }
    const {self: selfEventMap} = listenedToElements.get(base);
    if (!selfEventMap.has(event)) {
      selfEventMap.set(event, [boundListener]);
    } else {
      selfEventMap.get(event).push(boundListener);
    }
    base.addEventListener(event, boundListener);
    return () => {
      if (!selfEventMap.has(event))
        return;
      const listeners = selfEventMap.get(event);
      if (listeners.indexOf(boundListener) > -1) {
        base.removeEventListener(event, boundListener);
      }
      listeners.splice(listeners.indexOf(boundListener), 1);
      selfEventMap.set(event, listeners);
    };
  }
  Listeners3.listenToComponent = listenToComponent;
  function removeListeners(element, map) {
    for (const [event, listeners] of map.entries()) {
      for (const listener of Array.isArray(listeners) ? listeners : [listeners]) {
        element.removeEventListener(event, listener);
      }
    }
    map.clear();
  }
  function removeAllElementListeners(base) {
    if (!listenedToElements.has(base)) {
      return;
    }
    const {elements, identifiers, self, selfUnique} = listenedToElements.get(base);
    for (const {map, element} of elements.values()) {
      removeListeners(element, map);
    }
    elements.clear();
    for (const {map, element} of identifiers.values()) {
      removeListeners(element, map);
    }
    identifiers.clear();
    removeListeners(base, self);
    removeListeners(base, selfUnique);
  }
  Listeners3.removeAllElementListeners = removeAllElementListeners;
})(Listeners2 || (Listeners2 = {}));

// ../build/es/lib/component.js
var __decorate8 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ComponentClass2 = class {
  constructor() {
    this.idMap = new Map();
    this.idMapProxy = null;
    this.supportsProxy = typeof Proxy !== "undefined";
  }
  clearMap() {
    this.idMap.clear();
  }
  genIdMapProxy(self) {
    const __this = this;
    return new Proxy((selector) => {
      return self.root.querySelector(selector);
    }, {
      get(_, id) {
        if (typeof id !== "string") {
          return void 0;
        }
        const cached = __this.idMap.get(id);
        if (cached && self.shadowRoot.contains(cached)) {
          return cached;
        }
        const el = self.root.getElementById(id);
        if (el) {
          __this.idMap.set(id, el);
        }
        return el || void 0;
      }
    });
  }
  getIdMapSnapshot(self) {
    const snapshot = (selector) => {
      return self.root.querySelector(selector);
    };
    for (const item of self.root.querySelectorAll("[id]")) {
      snapshot[item.id] = item;
    }
    return snapshot;
  }
};
__decorate8([
  bindToClass2
], ComponentClass2.prototype, "clearMap", null);
var WebComponentMixin2 = (superFn) => {
  const privateMap = new WeakMap();
  function getPrivate(self) {
    if (privateMap.has(self))
      return privateMap.get(self);
    return privateMap.set(self, new ComponentClass2()).get(self);
  }
  class WebComponent extends superFn {
    constructor(...args) {
      super(...args);
      this.disposables = [];
      this.isMounted = false;
      this.___definerClass.internals.postRenderHooks.push(getPrivate(this).clearMap);
    }
    get isSSR() {
      return false;
    }
    get $() {
      const priv = getPrivate(this);
      if (priv.supportsProxy) {
        return priv.idMapProxy || (priv.idMapProxy = priv.genIdMapProxy(this));
      }
      return priv.getIdMapSnapshot(this);
    }
    $$(selector) {
      return [...this.root.querySelectorAll(selector)];
    }
    connectedCallback() {
      super.connectedCallback();
      if (!this.self) {
        throw new WCLibError2(this, "Missing .self property on component");
      }
      Props2.onConnect(this);
      this.renderToDOM(CHANGE_TYPE2.ALWAYS);
      this.layoutMounted();
      this.___definerClass.internals.connectedHooks.filter((fn) => fn());
    }
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      Listeners2.removeAllElementListeners(this);
      this.disposables.forEach((disposable) => disposable());
      this.disposables = [];
      this.isMounted = false;
      this.unmounted();
    }
    layoutMounted() {
    }
    mounted() {
    }
    unmounted() {
    }
    listenProp(event, listener, once = false) {
      this.listen(event, listener, once);
    }
  }
  const __typecheck__ = WebComponent;
  __typecheck__;
  return WebComponent;
};

// ../build/es/classes/parts.js
var FallbackHTMLElement2 = class {
  attachShadow(_init) {
    return {};
  }
  get tagName() {
    return "";
  }
  setAttribute() {
  }
  removeAttribute() {
  }
  hasAttribute() {
    return false;
  }
};
var elementBase2 = (() => {
  if (typeof HTMLElement !== "undefined") {
    return HTMLElement;
  } else {
    return process.HTMLElement || FallbackHTMLElement2;
  }
})();

// ../build/es/classes/full.js
var FullWebComponent2 = WebComponentMixin2(WebComponentCustomCSSManagerMixin2(WebComponentTemplateManagerMixin2(WebComponentI18NManagerMixin2(WebComponentThemeManagerMixin2(WebComponentHierarchyManagerMixin2(WebComponentListenableMixin2(WebComponentBaseMixin2(WebComponentDefinerMixin2(elementBase2)))))))));

// ../build/es/lib/configurable.js
var ConfigurableWebComponent2 = class extends FullWebComponent2 {
  get self() {
    return null;
  }
  getRenderArgs(changeType) {
    return super.getRenderArgs(changeType);
  }
};
function config2(config3) {
  const {is, html: html3, description, css = [], mixins = [], dependencies = []} = config3;
  return (target) => {
    const targetComponent = target;
    class WebComponentConfig extends targetComponent {
      get self() {
        return WebComponentConfig;
      }
    }
    WebComponentConfig.is = is;
    WebComponentConfig.description = description;
    WebComponentConfig.dependencies = [
      ...targetComponent.dependencies || [],
      ...dependencies
    ].filter((dependency, index, arr) => arr.indexOf(dependency) === index);
    WebComponentConfig.mixins = mixins;
    WebComponentConfig.html = html3;
    WebComponentConfig.css = css || [];
    target.mixins = mixins;
    target.dependencies = dependencies;
    return WebComponentConfig;
  };
}

// jsx-form/jsx-input.js
var __decorate9 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JsxInput = class JsxInput2 extends ConfigurableWebComponent2 {
  constructor() {
    super(...arguments);
    this._lastVal = "";
    this.props = Props2.define(this, {
      reflect: {
        name: {
          type: PROP_TYPE2.STRING,
          value: "name"
        },
        placeholder: {
          type: PROP_TYPE2.STRING,
          value: "placeholder"
        },
        type: {
          type: PROP_TYPE2.STRING,
          exactType: "",
          required: true
        }
      }
    });
  }
  onChange() {
    const newVal = this.$.input.value;
    if (newVal === this.props.placeholder)
      return;
    const lastVal = this._lastVal;
    this.fire("change", lastVal, newVal);
    this._lastVal = newVal;
  }
  onFocus() {
    if (this.$.input.value === this.props.placeholder) {
      this.$.input.classList.remove("placeholder");
      this.$.input.type = this.props.type;
      this.$.input.value = "";
    }
  }
  onBlur() {
    if (this.$.input.value === "") {
      this.$.input.classList.add("placeholder");
      this.$.input.value = this.props.placeholder;
      this.$.input.type = "text";
    }
  }
};
JsxInput = __decorate9([
  config2({
    is: "jsx-input",
    css: new TemplateFn2((html3) => {
      return html3`<style>
			input.placeholder {
				color: grey;
			}
		</style>`;
    }, CHANGE_TYPE2.NEVER, render),
    html: new TemplateFn2(function(html3, {props}) {
      return html3.jsx("div", {id: "container"}, html3.jsx("h2", null, props.name), html3.jsx("input", Object.assign({}, {"@": {
        "change": this.onChange,
        "focus": this.onFocus,
        "blur": this.onBlur
      }}, {class: "placeholder", type: "text", value: props.placeholder, id: "input"})));
    }, CHANGE_TYPE2.PROP, render)
  })
], JsxInput);

// jsx-form/jsx-form.html.js
var JsxFormHTML = new TemplateFn2(function(html3) {
  return html3.jsx("div", {id: "form"}, html3.jsx("h1", null, "Login form"), html3.jsx(JsxInput, {type: "text", name: "username", placeholder: "username"}), html3.jsx(JsxInput, {type: "password", name: "password", placeholder: "password"}), html3.jsx("button", {type: "submit"}, "Submit"));
}, CHANGE_TYPE2.PROP, render);

// jsx-form/jsx-form.js
var __decorate10 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JsxForm = class JsxForm2 extends ConfigurableWebComponent {
};
JsxForm = __decorate10([
  config({
    is: "jsx-form",
    css: null,
    html: JsxFormHTML,
    dependencies: [JsxInput]
  })
], JsxForm);
export {
  JsxForm
};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
