import {evaluateStringInComponentContext} from './evaluate-string-in-component-context';
import {WebComponent} from "../../core/web-component";

describe('evaluateStringInComponentContext', () => {
	class EvalApp extends WebComponent {
		str = 'simple';
		numb = 23;
		bool = false;
		arr = [2, 4, 6];
		obj = {x: 100};
		set = new Set([2, 6]);
	}

	EvalApp.bootstrap()

	const app = new EvalApp();

	document.body.appendChild(app);

	it('should return empty string if empty string executable', () => {
		expect(evaluateStringInComponentContext('', app)).toEqual('')
	});

	it('should throw error if there is any error', () => {
		expect(() => evaluateStringInComponentContext('none', app)).toThrowError('none is not defined');
	});

	it('should eval string based on component data', () => {
		expect(evaluateStringInComponentContext('str.toUpperCase() + " test"', app)).toEqual('SIMPLE test')
		expect(evaluateStringInComponentContext('(numb + 100).toFixed(2)', app)).toEqual('123.00')
		expect(evaluateStringInComponentContext('bool.valueOf()', app)).toEqual(false)
		expect(evaluateStringInComponentContext('arr.length', app)).toEqual(3)
		expect(evaluateStringInComponentContext('obj.x - 50', app)).toEqual(50)
		expect(evaluateStringInComponentContext('set.has(2)', app)).toEqual(true)
	});

	it('should eval string based on node data', () => {
		const data = {
			str: "NODE",
			numb: 10,
			list: [10, 3]
		};

		expect(evaluateStringInComponentContext('str.toUpperCase() + " test"', app, data)).toEqual('NODE test')
		expect(evaluateStringInComponentContext('(numb + 100).toFixed(2)', app, data)).toEqual('110.00')
		expect(evaluateStringInComponentContext('list.length', app, data)).toEqual(2)
	});
});
