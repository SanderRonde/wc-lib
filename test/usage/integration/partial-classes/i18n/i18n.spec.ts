import { i18nManagerSpec } from "../../classes/i18n-manager/i18nManagerspec";
import { componentSpec } from "../../classes/component/componentSpec";
import { listenerSpec } from "../../classes/listener/listenerSpec";
import { definerSpec } from "../../classes/definer/definerspec";
import { getPartialClassFixture } from "../../../lib/testing";
import { propsSpec } from "../../properties/props/propsspec";
import { baseSpec } from "../../classes/base/basespec";

context('I18N', function() {
	definerSpec(getPartialClassFixture('i18n', 'definer'));
	baseSpec(getPartialClassFixture('i18n', 'base'));
	listenerSpec(getPartialClassFixture('i18n', 'listener'));
	componentSpec(getPartialClassFixture('i18n', 'component'));
	propsSpec(getPartialClassFixture('i18n', 'props'), 
		getPartialClassFixture('i18n', 'props-no-proxy'), false);
	i18nManagerSpec({
		standard: getPartialClassFixture('i18n', 'i18n-manager'),
		root: getPartialClassFixture('i18n', 'i18n-manager-root'),
		defaults: getPartialClassFixture('i18n', 'i18n-manager-defaults')
	}, false);
});