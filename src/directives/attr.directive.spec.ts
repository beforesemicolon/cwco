import {Attr} from './attr.directive';
import {WebComponent} from "../core/web-component";

describe('Attr Directive', () => {
	class TestComp extends WebComponent {}
	TestComp.bootstrap();

	const dir = new Attr(new TestComp());

	it('should parse value', () => {
		expect(dir.parseValue('item, true', 'id')).toBe('["id", "", true, "item"]');
		expect(dir.parseValue('true', 'class.item')).toBe('["class", "item", true, ""]');
		expect(dir.parseValue('true', 'disabled')).toBe('["disabled", "", true, ""]');
		expect(dir.parseValue('test, true', 'data.sample-item')).toBe('["data", "sample-item", true, "test"]');
		expect(dir.parseValue('test, true', null)).toBe('["", "", true, "test"]');
	});

	describe('should change {element} as any attribute based on flag', () => {
		let element: HTMLElement;

		beforeEach(() => {
			element = document.createElement('div');
		})

		it('style', () => {
			expect(dir.render(['style', '', true, 'color: blue; text-align: center'], {element} as any).outerHTML)
				.toBe('<div style="color: blue; text-align: center;"></div>');

			// remove
			expect(dir.render(['style', '', false, 'color: blue; text-align: center'], {element} as any).outerHTML)
				.toBe('<div style=""></div>');
		});

		it('style property', () => {
			expect(dir.render(['style', 'color', true, 'red'], {element} as any).outerHTML)
				.toBe('<div style="color: red;"></div>');
			expect(dir.render(['style', 'text-align', true, 'center'], {element} as any).outerHTML)
				.toBe('<div style="color: red; text-align: center;"></div>');

			// remove
			expect(dir.render(['style', 'color', false, 'red'], {element} as any).outerHTML)
				.toBe('<div style="text-align: center;"></div>');
			expect(dir.render(['style', 'text-align', false, 'center'], {element} as any).outerHTML)
				.toBe('<div style=""></div>');
		});

		it('data', () => {
			expect(dir.render(['data', '', true, 'sample'], {element} as any).outerHTML)
				.toBe('<div></div>');

			// remove
			expect(dir.render(['data', '', false, 'sample'], {element} as any).outerHTML)
				.toBe('<div></div>');
		});

		it('data property', () => {
			expect(dir.render(['data', 'test-example', true, 'sample'], {element} as any).outerHTML)
				.toBe('<div data-test-example="sample"></div>');

			// remove
			expect(dir.render(['data', 'test-example', false, 'sample'], {element} as any).outerHTML)
				.toBe('<div></div>');
		});

		it('class', () => {
			expect(dir.render(['class', '', true, 'sample'], {element} as any).outerHTML)
				.toBe('<div class="sample"></div>');

			// remove
			expect(dir.render(['class', '', false, 'sample'], {element} as any).outerHTML)
				.toBe('<div class=""></div>');
		});

		it('class property', () => {
			expect(dir.render(['class', 'sample', true, 'ignored'], {element} as any).outerHTML)
				.toBe('<div class="sample"></div>');
			expect(dir.render(['class', 'test', true, ''], {element} as any).outerHTML)
				.toBe('<div class="sample test"></div>');

			// remove
			expect(dir.render(['class', 'sample', false, 'ignored'], {element} as any).outerHTML)
				.toBe('<div class="test"></div>');
			expect(dir.render(['class', 'test', false, ''], {element} as any).outerHTML)
				.toBe('<div class=""></div>');
		});

		it('boolean attribute', () => {
			expect(dir.render(['disabled', '', true, 'ignored'], {element} as any).outerHTML)
				.toBe('<div disabled=""></div>');
			expect(dir.render(['hidden', '', true, 'ignored'], {element} as any).outerHTML)
				.toBe('<div disabled="" hidden=""></div>');

			// remove
			expect(dir.render(['disabled', '', false, 'ignored'], {element} as any).outerHTML)
				.toBe('<div hidden=""></div>');
			expect(dir.render(['hidden', '', false, 'ignored'], {element} as any).outerHTML)
				.toBe('<div></div>');
		});

		it('value attribute', () => {
			expect(dir.render(['name', '', true, 'box'], {element} as any).outerHTML)
				.toBe('<div name="box"></div>');
			expect(dir.render(['custom', '', true, 'true'], {element} as any).outerHTML)
				.toBe('<div name="box" custom="true"></div>');

			// remove
			expect(dir.render(['name', '', false, 'box'], {element} as any).outerHTML)
				.toBe('<div custom="true"></div>');
			expect(dir.render(['custom', '', false, 'true'], {element} as any).outerHTML)
				.toBe('<div></div>');
		});
	});

});
