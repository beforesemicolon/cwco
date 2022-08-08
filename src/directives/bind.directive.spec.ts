import {Bind} from './bind.directive';
import {WebComponent} from "../core/web-component";

describe('Bind Directive', () => {
	class TestComp extends WebComponent {}
	TestComp.register();

	const dir = new Bind(new TestComp());

	it('should handle parsing', () => {
		expect(dir.parseValue('', '')).toEqual('["", ""]');
		expect(dir.parseValue('sample', '')).toEqual('["", "sample"]');
		expect(dir.parseValue('', 'value')).toEqual('["value", ""]');
		expect(dir.parseValue('sample', 'value')).toEqual('["value", "sample"]');
	});

	it('should render', () => {
		const element = {};

		dir.render(['sample', 12], {element} as any)

		expect(element).toEqual({'sample': 12});
	});

	it('should set text content if no prop', () => {
		const element = {};

		dir.render(['', 12], {element} as any)

		expect(element).toEqual({'textContent': 12});
	});
});
