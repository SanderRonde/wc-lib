import { themeManagerSpec } from "../../classes/theme-manager/themeManagerspec";
import { componentSpec } from "../../classes/component/componentSpec";
import { listenerSpec } from "../../classes/listener/listenerSpec";
import { definerSpec } from "../../classes/definer/definerspec";
import { getPartialClassFixture } from "../../../lib/testing";
import { propsSpec } from "../../properties/props/propsspec";
import { baseSpec } from "../../classes/base/basespec";

context('Theming', function() {
	definerSpec(getPartialClassFixture('theming', 'definer'));
	baseSpec(getPartialClassFixture('theming', 'base'));
	listenerSpec(getPartialClassFixture('theming', 'listener'));
	componentSpec(getPartialClassFixture('theming', 'component'));
	propsSpec(getPartialClassFixture('theming', 'props'), 
		getPartialClassFixture('theming', 'props-no-proxy'), false);
	themeManagerSpec({
		standardFixture: getPartialClassFixture('theming', 'theme-manager'),
		invalidFixture: getPartialClassFixture('theming', 'theme-manager-invalid'),
		separateFixture: getPartialClassFixture('theming', 'theme-manager-separate')
	}, false)
});