import {setComponentPropertiesFromObservedAttributes} from './set-component-properties-from-observed-attributes';

describe('', () => {
	const observedAttributes = ['sample-test', 'disabled', 'formnovlidate', 'class', 'style', 'data-x'];

	it('should set getters and setters and call update on changes', () => {
		const comp = document.createElement('div') as any;
		const onUpdate = jest.fn();

		setComponentPropertiesFromObservedAttributes(comp, observedAttributes, {
			'sample-test': 'sampleTest',
			'disabled': 'disabled',
			'formnovlidate': 'formnovlidate',
			'class': 'class',
			'style': 'style',
			'data-x': 'dataX',
		}, onUpdate);

		expect(comp.sampleTest).toEqual('');
		expect(comp.disabled).toEqual(false);
		expect(comp.formNoValidate).toEqual(false);
		expect(comp.class).not.toBeDefined();
		expect(comp.style).toBeInstanceOf(CSSStyleDeclaration);
		expect(comp.dataX).not.toBeDefined();

		comp.disabled = false;

		expect(onUpdate).not.toHaveBeenCalled();

		onUpdate.mockClear();

		comp.disabled = true;

		expect(onUpdate).toHaveBeenCalledWith("disabled", false, true);

	});
});