import {defineNodeContextMetadata} from "./define-node-context-metadata";
import {$} from "../../core/metadata";

describe('defineNodeContextMetadata', () => {
	let node: HTMLElement;

	beforeEach(() => {
		node && $.delete(node);
		node = document.createElement('div');
	})

	it('should set node $context', () => {
		expect($.has(node)).toBeFalsy();

		defineNodeContextMetadata(node);

		expect($.has(node)).toBeTruthy();
		expect($.get(node).$context).toEqual({})
		expect(typeof $.get(node).updateContext).toBe('function')
	});

	it('should return if already exists', () => {
		defineNodeContextMetadata(node);

		expect($.has(node)).toBeTruthy();

		$.get(node).test = true;

		expect($.get(node).test).toBe(true);

		defineNodeContextMetadata(node);

		expect($.get(node).test).toBe(true);
	});

	it('should inherit context from parent node and update on changes', () => {
		const parent = document.createElement('div');
		parent.appendChild(node);

		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);
		
		expect($.get(node).$context).toEqual({});

		$.get(parent).updateContext({
			some: 'content'
		});

		expect($.get(parent).$context.some).toEqual("content");
		expect($.get(node).$context.some).toEqual("content");
	});
	
	it('should unsubscribe and subscribe when remove and attached to element',  () => {
		const parent = document.createElement('div');

		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);

		expect($.get(node).$context).toEqual({});

		$.get(parent).updateContext({
			some: 'content'
		});

		parent.appendChild(node);

		expect($.get(node).$context.some).toEqual("content");

		parent.removeChild(node);

		expect($.get(node).$context).toEqual({});

		// try new parent node
		const newParent = document.createElement('div');

		defineNodeContextMetadata(newParent);

		$.get(newParent).updateContext({
			some: 'new content'
		});

		newParent.appendChild(node);

		expect($.get(node).$context.some).toEqual("new content");

		$.get(newParent).updateContext({
			some: 'newly updated content'
		});

		expect($.get(node).$context.some).toEqual("newly updated content");
	});

	it('should list all keys including inherited ones', () => {
		const parent = document.createElement('div');

		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);

		parent.appendChild(node);

		$.get(parent).updateContext({
			some: 'content'
		});

		$.get(node).updateContext({
			my: 'content'
		});

		expect(Object.keys($.get(node).$context)).toEqual(['some', 'my']);
		expect(Object.getOwnPropertyNames($.get(node).$context)).toEqual(['some', 'my']);
	});
});
