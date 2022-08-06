import {Repeat} from './repeat.directive';
import {WebComponent} from "../core/web-component";

describe('Repeat Directive', () => {
	class TestComp extends WebComponent {}
	TestComp.bootstrap();

	const dir = new Repeat(new TestComp());
	// @ts-ignore
	const setContextSpy = jest.spyOn(dir, 'updateContext');
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement('div');
		element.className = 'item-{$key}';
		element.innerHTML = 'item {$item}';
		element.setAttribute('if', 'true');
	})

	afterEach(() => {
		setContextSpy.mockClear();
	})

	afterAll(() => {
		// @ts-ignore
		setContextSpy.mockRestore();
	})

	it('should repeat element with numbers', () => {
		element.setAttribute('repeat', '3');
		const res = dir.render([3], {element, rawElementOuterHTML: element.outerHTML} as any);

		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="3">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="3">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="3">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="3">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(3)
		expect(dir.getContext(res[0])).toEqual({$item: 1, $key: 0})
		expect(dir.getContext(res[1])).toEqual({$item: 2, $key: 1})
		expect(dir.getContext(res[2])).toEqual({$item: 3, $key: 2})
	});

	it('should repeat element with array', () => {
		element.setAttribute('repeat', '[2, 4, 6]');
		const res = dir.render([[2, 4, 6]], {element, rawElementOuterHTML: element.outerHTML} as any);

		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(3)
		expect(dir.getContext(res[0])).toEqual({$item: 2, $key: "0"})
		expect(dir.getContext(res[1])).toEqual({$item: 4, $key: "1"})
		expect(dir.getContext(res[2])).toEqual({$item: 6, $key: "2"})
	});
	
	it('should repeat element with typed array', () => {
		element.setAttribute('repeat', '[2, 4, 6]');
		const res = dir.render([new Int8Array([2, 4, 6])], {element, rawElementOuterHTML: element.outerHTML} as any);
		
		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(3)
		expect(dir.getContext(res[0])).toEqual({$item: 2, $key: "0"})
		expect(dir.getContext(res[1])).toEqual({$item: 4, $key: "1"})
		expect(dir.getContext(res[2])).toEqual({$item: 6, $key: "2"})
	});

	it('should repeat element with object', () => {
		element.setAttribute('repeat', '{a: 100, b: 200, c: 300}');
		const res = dir.render([{a: 100, b: 200, c: 300}], {element, rawElementOuterHTML: element.outerHTML} as any);

		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="{a: 100, b: 200, c: 300}">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="{a: 100, b: 200, c: 300}">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="{a: 100, b: 200, c: 300}">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}" if="true" repeat="{a: 100, b: 200, c: 300}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(3)
		// @ts-ignore
		expect(dir.getContext(res[0])).toEqual({$item: 100, $key: "a"})
		// @ts-ignore
		expect(dir.getContext(res[1])).toEqual({$item: 200, $key: "b"})
		// @ts-ignore
		expect(dir.getContext(res[2])).toEqual({$item: 300, $key: "c"})
	});
	
	it('should parse "as" value', () => {
		expect(dir.parseValue('list as')).toEqual('[list, "", ""]')
		expect(dir.parseValue('list as item')).toEqual('[list, "item", ""]')
		expect(dir.parseValue('[1, 2, 3] as item')).toEqual('[[1, 2, 3], "item", ""]')
		expect(dir.parseValue('list as item; $key as i')).toEqual('[list, "item", "i"]')
		expect(dir.parseValue('$key as i')).toEqual('[$key, "i", ""]')
		expect(dir.parseValue('list as item; $key as')).toEqual('[list, "item", ""]')
		expect(dir.parseValue('list as item; $o as i')).toEqual('[list, "item", ""]')
		expect(dir.parseValue('{x: 1; b: 10;} as item; $o as i')).toEqual('[{x: 1; b: 10;}, "item", ""]')
		expect(dir.parseValue('{x: 1; b: 10;}; $key as i')).toEqual('[{x: 1; b: 10;}, "$item", "i"]')
		expect(dir.parseValue('list as item; $key')).toEqual('[list, "item", "$key"]')
		expect(dir.parseValue('list; $key')).toEqual('[list, "$item", "$key"]')
	});
	
	it('should use the key provided', () => {
		const value = 'menu as pg; $key as index';
		element = document.createElement('div');
		element.className = 'item-{index}';
		element.innerHTML = 'item {pg}';
		element.setAttribute('repeat', value);
		const res = dir.render([['pg1', 'pg2', 'pg3'], 'pg', 'index'], {element, rawElementOuterHTML: element.outerHTML} as any);
		
		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(dir.parseValue(value)).toBe('[menu, "pg", "index"]')
		expect(element.outerHTML).toBe('<div class="item-{index}" repeat="menu as pg; $key as index">item {pg}</div>');
		expect(setContextSpy).toHaveBeenCalledTimes(3)
		expect(dir.getContext(res[0])).toEqual({pg: 'pg1', index: "0"})
		expect(dir.getContext(res[1])).toEqual({pg: 'pg2', index: "1"})
		expect(dir.getContext(res[2])).toEqual({pg: 'pg3', index: "2"})
	});
});
