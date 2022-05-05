import {setupComponentPropertiesForAutoUpdate} from './setup-component-properties-for-auto-update';
import {WebComponent} from "../web-component";

describe('setupComponentPropertiesForAutoUpdate', () => {
	class PropComp extends WebComponent {
		static observedAttributes = ['sample-test'];

		sampleTest = 12;
		testSample = '';
		x = [12, 45];

		get read() {
			return null;
		}

		set write(val: any) {}
	}
	
	PropComp.register()

	it('should change only properties to getter and setter as long as they are not observed attributes', () => {
		const comp = new PropComp();
		const onUpdate = jest.fn();

		setupComponentPropertiesForAutoUpdate(comp as any, onUpdate)

		comp.sampleTest = 30;

		expect(onUpdate).not.toHaveBeenCalled();

		comp.testSample = 'changed';

		expect(comp.testSample).toEqual('changed');
		expect(onUpdate).toHaveBeenCalledWith('testSample', '', 'changed');

		onUpdate.mockClear();

		comp.x = [];

		expect(comp.x).toEqual([]);
		expect(onUpdate).toHaveBeenCalledWith("x", [12, 45], []);

	});

});
