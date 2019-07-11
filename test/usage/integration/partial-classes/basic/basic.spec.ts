import { componentSpec } from "../../classes/component/componentSpec";
import { listenerSpec } from "../../classes/listener/listenerSpec";
import { definerSpec } from "../../classes/definer/definerspec";
import { getPartialClassFixture } from "../../../lib/testing";
import { baseSpec } from "../../classes/base/basespec";
import { propsSpec } from "../../properties/props/propsspec";

context('Basic', function() {
	definerSpec(getPartialClassFixture('basic', 'definer'));
	baseSpec(getPartialClassFixture('basic', 'base'));
	listenerSpec(getPartialClassFixture('basic', 'listener'));
	componentSpec(getPartialClassFixture('basic', 'component'));
	propsSpec(getPartialClassFixture('basic', 'props'), 
		getPartialClassFixture('basic', 'props-no-proxy'), false);
});