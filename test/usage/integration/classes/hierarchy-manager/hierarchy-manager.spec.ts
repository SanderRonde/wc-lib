/// <reference types="Cypress" />

import { hierarchyManagerspec } from './hierarchyManagerspec';
import { getClassFixture } from '../../../lib/testing';

hierarchyManagerspec(getClassFixture('hierarchy-manager'));
