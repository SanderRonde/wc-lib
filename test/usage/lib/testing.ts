export function getFixture(dir: string, suiteName: string, fixtureName: string = 'standard') {
	return `http://localhost:1251/test/usage/integration/${dir}/${
		suiteName}/fixtures/${fixtureName}/${suiteName}.fixture.html`;
}

export function getClassFixture(className: string, fixtureName: string = 'standard') {
	return getFixture('classes', className, fixtureName);
}

export function getPropertyFixture(suiteName: string, fixtureName: string = 'standard') {
	return getFixture('properties', suiteName, fixtureName);
}