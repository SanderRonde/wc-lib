import { componentSpec } from "../../classes/component/componentspec";
import { listenerSpec } from "../../classes/listener/listenerspec";
import { definerSpec } from "../../classes/definer/definerspec";
import { getPartialClassFixture } from "../../../lib/testing";
import { propsSpec } from "../../properties/props/propsspec";
import { baseSpec } from "../../classes/base/basespec";

context('Basic', function() {
	definerSpec(getPartialClassFixture('basic', 'definer'));
	baseSpec(getPartialClassFixture('basic', 'base'));
	listenerSpec(getPartialClassFixture('basic', 'listener'));
	componentSpec(getPartialClassFixture('basic', 'component'));
	propsSpec(getPartialClassFixture('basic', 'props'), 
		getPartialClassFixture('basic', 'props-no-proxy'), false);
});