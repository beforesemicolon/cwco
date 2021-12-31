import {resolveExecutable} from './resolve-executable';

describe('resolveExecutable', () => {
	const app: any = {
		$context: {},
		$properties: [],
	}

	it('should resolve executable when data is simple string', () => {
		expect(resolveExecutable(app, {sample: 'test'}, {
			match: '{sample}',
			executable: 'sample'
		} as any, 'some {sample} content')).toEqual('some test content')
	});

	it('should resolve executable when data is object', () => {
		expect(resolveExecutable(app, {sample: {cool: 'data'}}, {
			match: '{sample}',
			executable: 'sample'
		} as any, 'some {sample} content')).toEqual('some {"cool":"data"} content')
	});
});
