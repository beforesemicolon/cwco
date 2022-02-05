import {Ref} from "./ref.directive";
import {WebComponent} from "../core/web-component";

describe('Ref Directive', () => {
	class TestComp extends WebComponent {}
	TestComp.register();

	const dir = new Ref(new TestComp());

	it('should parse value', () => {
		expect(dir.parseValue('sample')).toBe('"sample"')
	});

	it('should return node if name is valid', () => {
		// @ts-ignore
		const setRefSPy = jest.spyOn(dir, 'setRef');
		const element = document.createElement('div');

		expect(dir.render('span', {element} as any)).toEqual(element);
		expect(setRefSPy).toHaveBeenCalledWith('span', element);

		setRefSPy.mockRestore();
	});

	it('should throw error if name is invalid', () => {
		expect(() => dir.render('^span', {} as any)).toThrowError('Invalid "ref" property name "^span"');
		expect(() => dir.render('span-name', {} as any)).toThrowError('Invalid "ref" property name "span-name"');
	});
});
