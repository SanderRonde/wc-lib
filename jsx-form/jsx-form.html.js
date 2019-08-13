import { render } from '../modules/lit-html/lit-html.js';
import { TemplateFn } from '../modules/wc-lib/wc-lib.js';
import { JsxInput } from './jsx-input.js';
export const JsxFormHTML = new TemplateFn(function (html) {
    return (html.jsx("div", { id: "form" },
        html.jsx("h1", null, "Login form"),
        html.jsx(JsxInput, { type: "text", name: "username", placeholder: "username" }),
        html.jsx(JsxInput, { type: "password", name: "password", placeholder: "password" }),
        html.jsx("button", { type: "submit" }, "Submit")));
}, 1 /* PROP */, render);
