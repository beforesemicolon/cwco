import {resolveExecutables} from './resolve-executables';
import {extractExecutableSnippetFromString} from "./extract-executable-snippet-from-string";

describe('resolveExecutable', () => {
	const app: any = {
		$context: {},
		$properties: [],
	}

	it('should resolve executables with starting and ending string', () => {
		const str = 'sample {data.key} mid {data.value} end';
		const execs = extractExecutableSnippetFromString(str);
		const res = resolveExecutables(str, app, {data: {key: 'test', value: 'val'}}, execs)

		expect(res).toEqual('sample test mid val end')
	});

	it('should resolve executables with no ending string', () => {
		const str = 'sample {data.key} mid {data.value}';
		const execs = extractExecutableSnippetFromString(str);
		const res = resolveExecutables(str, app, {data: {key: 'test', value: 'val'}}, execs)

		expect(res).toEqual('sample test mid val')
	});

	it('should resolve executables with no starting string', () => {
		const str = '{data.key} mid {data.value} end';
		const execs = extractExecutableSnippetFromString(str);
		const res = resolveExecutables(str, app, {data: {key: 'test', value: 'val'}}, execs)

		expect(res).toEqual('test mid val end')
	});

	it('should resolve executables with single non-string executable', () => {
		const str = '{data}';
		const execs = extractExecutableSnippetFromString(str);
		const res = resolveExecutables(str, app, {data: {key: 'test', value: 'val'}}, execs)

		expect(res).toEqual({key: 'test', value: 'val'})
	});

	it('should resolve executables with single non-string variable', () => {
		const str = 'data';
		const execs = extractExecutableSnippetFromString(str);
		const res = resolveExecutables(str, app, {data: {key: 'test', value: 'val'}}, execs)

		expect(res).toEqual('data')
	});
});
