import {If} from './if.directive';
import {WebComponent} from "../web-component";

describe('If Directive', () => {
	class TestComp extends WebComponent {}
	TestComp.register();

	const dir = new If(new TestComp());
	const element = document.createElement('div');

	it('should return null if falsy', () => {
		expect(dir.render(false, {element} as any)).toEqual(document.createComment(' if: false '));
	});

	it('should return node if truthy', () => {
		expect(dir.render(true, {element} as any)).toEqual(element);
	});
});
