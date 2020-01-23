/// <reference types="Cypress" />

import { getClassFixture } from '../../../lib/testing';
import { listenerSpec } from './listenerspec';

listenerSpec(getClassFixture('listener'));
