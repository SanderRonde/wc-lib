export function getFixture(className: string, fixtureName: string = 'standard') {
	return `http://localhost:1251/test/usage/integration/classes/${
		className}/fixtures/${fixtureName}/${className}.fixture.html`
}