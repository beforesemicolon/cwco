import {getEventHandlerFunction} from "./get-event-handler-function";
import {WebComponent} from "../../core/web-component";

describe('getEventHandlerFunction', () => {
	const errorSpy = jest.fn();

	class EventApp extends WebComponent {
		handleClick() {}

		onError(error: ErrorEvent | Error) {
			errorSpy(error)
		}
	}

	EventApp.register()

	const app = new EventApp();

	document.body.appendChild(app);

	it('should return a function callback', () => {
		const attr = {name: 'onclick', value: 'handleClick($event)'};

		const res = getEventHandlerFunction(app, {}, attr as Attr);

		expect(res?.toString()).toEqual('(event) => func.call(component, event, ...values)');
	});

	describe('should get listener', () => {
		class MyButton extends WebComponent {
			onClick() {}

			sampler = [];

			clicked = () => {}
		}
		MyButton.register();
		const btn = new MyButton();

		it('if function exists', () => {
			btn.onClick = jest.fn();
			btn.clicked = jest.fn();

			let handler = getEventHandlerFunction(btn as any, {}, {name: 'click', value: 'clicked("sample", 300)'} as Attr) as any;

			expect(handler.toString()).toEqual('(event) => func.call(component, event, ...values)')

			handler({type: 'click'} as any);

			expect(btn.clicked).toHaveBeenCalledWith("sample", 300);

			// @ts-ignore
			btn.onClick.mockClear();

			handler = getEventHandlerFunction(btn as any, {}, {name: 'click', value: 'this.onClick($event, 12, [23, 45])'} as Attr);

			handler({type: 'click'} as any);

			expect(btn.onClick).toHaveBeenCalledWith({"type": "click"}, 12, [23, 45]);

			handler = getEventHandlerFunction(btn as any, {$item: [23, 45]}, {name: 'click', value: 'onClick($item)'} as Attr);

			handler({type: 'click'} as any);

			expect(btn.onClick).toHaveBeenCalledWith([23, 45]);

			jest.resetAllMocks();
		});

		it('with executables', () => {
			let handler = getEventHandlerFunction(btn as any, {}, {name: 'click', value: '{this.sampler = [2, 4, 6]}'} as Attr) as any;

			expect(handler.toString()).toEqual('(event) => func.call(component, event, ...values)');

			handler({type: 'click'} as any);

			expect(btn.sampler).toEqual([
				2,
				4,
				6
			]);

			handler = getEventHandlerFunction(btn as any, {$item: {x: 10}}, {name: 'click', value: '{this.sampler = $item}'} as Attr) as any;

			handler({type: 'click'} as any);

			expect(btn.sampler).toEqual({x: 10});
		});

		it('without executables', () => {
			let handler = getEventHandlerFunction(btn as any, {}, {name: 'click', value: 'this.sampler = [2, 4, 6]'} as Attr) as any;

			expect(handler.toString()).toEqual('(event) => func.call(component, event, ...values)');

			handler({type: 'click'} as any);

			expect(btn.sampler).toEqual([
				2,
				4,
				6
			]);

			handler = getEventHandlerFunction(btn as any, {$item: {x: 10}}, {name: 'click', value: '{this.sampler = $item}'} as Attr) as any;

			handler({type: 'click'} as any);

			expect(btn.sampler).toEqual({x: 10});
		});
	});
});
