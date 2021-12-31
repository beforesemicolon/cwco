import {getComponentNodeEventListener} from './get-component-node-event-listener';

describe('getComponentNodeEventListener', () => {
	class Button {
		onClick() {}

		sampler = [];

		clicked = () => {}
	}
	const btn = new Button();

	it('should get listener if function exists', () => {
		btn.onClick = jest.fn();
		btn.clicked = jest.fn();

		let handler = getComponentNodeEventListener(btn as any, 'click', 'clicked("sample", 300)') as any;

		expect(handler.toString()).toEqual('(event) => func.call(component, event, ...values)')

		handler({type: 'click'} as any);

		expect(btn.clicked).toHaveBeenCalledWith("sample", 300);

		// @ts-ignore
		btn.onClick.mockClear();

		handler = getComponentNodeEventListener(btn as any, 'click', 'this.onClick($event, 12, [23, 45])');

		handler({type: 'click'} as any);

		expect(btn.onClick).toHaveBeenCalledWith({"type": "click"}, 12, [23, 45]);

		handler = getComponentNodeEventListener(btn as any, 'click', 'onClick($item)', ['$item'], [[23, 45]]);

		handler({type: 'click'} as any);

		expect(btn.onClick).toHaveBeenCalledWith([23, 45]);

		jest.resetAllMocks();
	});

	it('should return null if function does not exist or is not a function', () => {
		expect(getComponentNodeEventListener(btn as any, 'click', 'onTest()')).toBeNull()
		expect(getComponentNodeEventListener(btn as any, 'click', 'sampler()')).toBeNull()
		expect(getComponentNodeEventListener(btn as any, 'click', 'onClick')).toBeNull()
	});

	it('should get listener with executables', () => {
		let handler = getComponentNodeEventListener(btn as any, 'click', '{this.sampler = [2, 4, 6]}') as any;

		expect(handler.toString()).toEqual('(event) => fn.call(component, event, ...values)');

		handler({type: 'click'} as any);

		expect(btn.sampler).toEqual([
			2,
			4,
			6
		]);

		handler = getComponentNodeEventListener(btn as any, 'click', '{this.sampler = $item}', ['$item'], [{x: 10}]) as any;

		handler({type: 'click'} as any);

		expect(btn.sampler).toEqual({x: 10});
	});
});