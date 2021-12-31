import {getEventHandlerFunction} from "./get-event-handler-function";
import {WebComponent} from "../web-component";

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

	it('should return null if invalid value', () => {
		const attr = {name: 'onclick', value: 'null'};

		const res = getEventHandlerFunction(app, {}, attr as Attr);

		expect(res).toEqual(null);
		expect(errorSpy).toHaveBeenCalledWith(new Error('EventApp: Invalid event handler for "onclick" >>> "null".'));
	});
});
