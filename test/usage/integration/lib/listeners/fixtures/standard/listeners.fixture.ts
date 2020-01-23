import { TestElement } from '../../../../classes/elements/test-element.js';
import { Listeners } from '../../../../../../../build/es/wc-lib.js';

export interface ListenerWindow extends Window {
    Listeners: typeof Listeners;
}
declare const window: ListenerWindow;

TestElement.define(true);
window.Listeners = Listeners;
