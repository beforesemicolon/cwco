import {$} from "../core/$";
import {WebComponent} from "../core/WebComponent";
import {NodeTrack} from "./NodeTrack";
import {trackNode} from "./track-node";
import {trackNodeTree} from "./track-node-tree";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";

describe('NodeTrack', () => {
	class CompBase extends WebComponent {}
	CompBase.register();
	let comp: CompBase

	beforeEach(() => {
		document.body.innerHTML = '';
		comp = new CompBase();
	})

	it('should handle text node', () => {
		const node = document.createTextNode('{sample}');

		document.body.appendChild(node);

		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		comp.updateContext({'sample': 200});

		expect(document.body.innerHTML).toBe('{sample}');

		nt.updateNode();

		expect(document.body.innerHTML).toBe('200');
	});

	it('should handle directive with node anchor', () => {
		const node = document.createElement('div');
		node.textContent = 'content'
		node.setAttribute('if', 'sample');

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		comp.updateContext({'sample': true});

		expect(document.body.innerHTML).toBe('<div>content</div>');

		comp.updateContext({'sample': false});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<!-- if: false -->');

		comp.updateContext({'sample': true});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div>');
	});

	it('should handle directive with array of node anchors', () => {
		const node = document.createElement('div');
		node.textContent = 'content'
		node.setAttribute('repeat', 'count');

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		comp.updateContext({'count': 2});

		expect(document.body.innerHTML).toBe('<div>content</div>');

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div><div>content</div>');

		comp.updateContext({'count': 1});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div>');

		comp.updateContext({'count': 0});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<!--<div repeat="count">content</div>-->');

		comp.updateContext({'count': 1});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div>');

		comp.updateContext({'count': 2});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div><div>content</div>');
	});

	it('should handle attribute track', () => {
		const node = document.createElement('div');
		node.textContent = 'content'
		node.setAttribute('class', '{cls}');

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		comp.updateContext({'cls': 'box'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div class="box">content</div>');
	});

	it('should handle property track', () => {
		const node = document.createElement('textarea');
		node.textContent = '{val}'

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		comp.updateContext({'val': 'some text'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<textarea>some text</textarea>');
	});

	it('should handle deep updates', () => {
		const node = document.createElement('div');
		node.setAttribute('class', '{cls}');
		node.innerHTML = '{content}'

		document.body.appendChild(node);

		const nt = new NodeTrack(document.createElement('div'), comp);
		trackNodeTree(node, nt, comp)

		comp.updateContext({cls: 'box', content: 'some content'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div class="box">some content</div>');

		comp.updateContext({content: 'diff content'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div class="box">diff content</div>');
	});
})
