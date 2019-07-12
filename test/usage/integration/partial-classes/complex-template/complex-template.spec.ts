import { hierarchyManagerspec } from "../../classes/hierarchy-manager/hierarchyManagerspec";
import { templateManagerSpec } from "../../classes/template-manager/templateManagerspec";
import { componentSpec } from "../../classes/component/componentspec";
import { listenerSpec } from "../../classes/listener/listenerspec";
import { definerSpec } from "../../classes/definer/definerspec";
import { getPartialClassFixture } from "../../../lib/testing";
import { propsSpec } from "../../properties/props/propsspec";
import { baseSpec } from "../../classes/base/basespec";

context('Complex Template', function() {
	definerSpec(getPartialClassFixture('complex-template', 'definer'));
	baseSpec(getPartialClassFixture('complex-template', 'base'));
	listenerSpec(getPartialClassFixture('complex-template', 'listener'));
	componentSpec(getPartialClassFixture('complex-template', 'component'));
	propsSpec(getPartialClassFixture('complex-template', 'props'), 
		getPartialClassFixture('complex-template', 'props-no-proxy'), false);
	hierarchyManagerspec(
		getPartialClassFixture('complex-template', 'hierarchy-manager'));
	templateManagerSpec({
		standard: getPartialClassFixture('complex-template', 'template-manager'),
		wrong: getPartialClassFixture('complex-template', 'template-manager-wrong'),
	});
});