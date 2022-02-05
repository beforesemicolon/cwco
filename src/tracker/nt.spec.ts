import {NodeTrack, Track, trackNode, trackNodeTree, TrackType} from "./nt";
import {WebComponent} from "../web-component";
import {directiveRegistry} from "../directives/registry";
import {parse} from "../utils/parse";
import {defineNodeContextMetadata} from "../utils/define-node-context-metadata";
import {$} from "../metadata";

class CompBase extends WebComponent {}
CompBase.register();
const comp = new CompBase();

describe('trackNode', () => {
	it('should track text', () => {
		expect(trackNode(document.createTextNode('sample'), comp)).toEqual({"attribute": [], "directive": [], "property": []});
		expect(trackNode(document.createTextNode('{sample}'), comp)).toEqual((() => {
			const track = new Track('nodeValue', '{sample}', TrackType.property)
			track.executables = [
				{
					"executable": "sample",
					"from": 0,
					"match": "{sample}",
					"to": 7
				}
			]

			return {
				"attribute": [],
				"directive": [],
				"property": [
					track
				]
			}
		})());
	});

	it('should track style', () => {
		expect(trackNode(document.createElement('style'), comp)).toEqual({"attribute": [], "directive": [], "property": []});

		const style = document.createElement('style');
		style.id = 'main';
		style.className = 'btn-style btn-{type}';
		style.setAttribute('if', 'special');
		style.innerHTML = ':host {display: [display]}';

		expect(trackNode(style, comp)).toEqual((() => {
			const track1 = new Track('if', 'special', TrackType.directive)
			const track2 = new Track('class', style.className, TrackType.attribute)
			const track3 = new Track('textContent', style.innerHTML, TrackType.property)
			track1.handler = directiveRegistry['if'];
			track2.executables = [
				{
					"executable": "type",
					"from": 14,
					"match": "{type}",
					"to": 19
				}
			];
			track3.executables = [
				{
					"executable": "display",
					"from": 16,
					"match": "[display]",
					"to": 24
				}
			]

			return {"attribute": [track2], "directive": [track1], "property": [track3]}
		})());
	});

	it('should track textarea', () => {
		expect(trackNode(document.createElement('textarea'), comp)).toEqual({"attribute": [], "directive": [], "property": []});

		const textArea = document.createElement('textarea');
		textArea.name = '{name}';
		textArea.rows = 2;
		textArea.setAttribute('bind.value', '{value}');
		textArea.innerHTML = '{value}';

		expect(trackNode(textArea, comp)).toEqual((() => {
			const track1 = new Track('textContent', '{value}', TrackType.property)
			const track2 = new Track('bind', '{value}', TrackType.directive)
			const track3 = new Track('name', '{name}', TrackType.attribute)

			track1.executables = [
				{
					"executable": "value",
					"from": 0,
					"match": "{value}",
					"to": 6
				}
			];
			track2.handler = directiveRegistry['bind'];
			track2.prop = "value";
			track3.executables = [
				{
					"executable": "name",
					"from": 0,
					"match": "{name}",
					"to": 5
				}
			]

			return {"attribute": [track3], "directive": [track2], "property": [track1]}
		})());
	});

	it('should track any other node', () => {
		expect(trackNode(document.createElementNS('http://www.w3.org/2000/svg', 'rect'), comp))
			.toEqual({"attribute": [], "directive": [], "property": []});

		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rect.setAttribute('width', '{width}');
		rect.setAttribute('height', '200');
		rect.setAttribute('attr.x', '{x}');
		rect.setAttribute('y', '10');

		expect(trackNode(rect, comp)).toEqual((() => {
			const track1 = new Track('attr', '{x}', TrackType.directive)
			const track2 = new Track('width', '{width}', TrackType.attribute)

			track1.handler = directiveRegistry['attr'];
			track1.prop = "x";
			track2.executables = [
				{
					"executable": "width",
					"from": 0,
					"match": "{width}",
					"to": 6
				}
			]

			return {"attribute": [track2], "directive": [track1], "property": []}
		})());

		const btn = document.createElement('button');
		btn.className = 'btn';
		btn.setAttribute('type', '{type}');
		btn.setAttribute('attr.disabled', 'disabled');
		btn.textContent = '{label}'; // should be ignored

		expect(trackNode(btn, comp)).toEqual((() => {
			const track1 = new Track('attr', 'disabled', TrackType.directive)
			const track2 = new Track('type', '{type}', TrackType.attribute)

			track1.handler = directiveRegistry['attr'];
			track1.prop = "disabled";
			track2.executables = [
				{
					"executable": "type",
					"from": 0,
					"match": "{type}",
					"to": 5
				}
			]

			return {"attribute": [track2], "directive": [track1], "property": []}
		})());
	});
});

describe('trackNodeTree', () => {
	it('should track parsed html', (done) => {
		class Comp extends HTMLElement {
			constructor() {
				super();

				this.attachShadow({mode: 'open'});

				const frag = parse(
					'<style if="withStyle">{:host {display: [display]}}</style>' +
					'<some-comp>' +
						'<div attr.data.sample="12">' +
							'{sample}' +
						'</div>' +
					'</some-comp>' +
					'<section>' +
						'<h2>{title}</h2>' +
						'<another-comp repeat="2">' +
							'Lorem ipsum {$item}' +
						'</another-comp>' +
						'<slot></slot>' +
					'</section>');

				const track = new NodeTrack(this, comp);

				expect(track.childNodeTracks).toEqual([])

				trackNodeTree(frag, track, comp);

				// wait for slot to execute
				setTimeout(() => {
					expect(track.childNodeTracks.size).toBe(5)
					// track 1
					expect(Array.from(track.childNodeTracks.values())[0].node.nodeName).toBe('STYLE');
					expect(Array.from(track.childNodeTracks.values())[0].tracks.property.length).toBe(1);
					expect(Array.from(track.childNodeTracks.values())[0].tracks.directive.length).toBe(1);
					expect(Array.from(track.childNodeTracks.values())[0].tracks.property[0].name).toBe('textContent');
					expect(Array.from(track.childNodeTracks.values())[0].tracks.directive[0].name).toBe('if');
					expect(Array.from(track.childNodeTracks.values())[0].childNodeTracks.size).toBe(0);
					// track 2
					expect(Array.from(track.childNodeTracks.values())[1].node.nodeName).toBe('SOME-COMP');
					expect(Array.from(track.childNodeTracks.values())[1].tracks.attribute.length).toBe(0);
					expect(Array.from(track.childNodeTracks.values())[1].tracks.directive.length).toBe(0);
					expect(Array.from(track.childNodeTracks.values())[1].childNodeTracks.size).toBe(1);
					expect(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].node.nodeName).toBe('DIV');
					expect(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].tracks.directive.length).toBe(1);
					expect(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].tracks.directive[0].name).toBe('attr');
					expect(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].childNodeTracks.size).toBe(1);
					expect(Array.from(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].childNodeTracks.values())[0].tracks.property.length).toBe(1);
					expect(Array.from(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].childNodeTracks.values())[0].tracks.property[0].name).toBe('nodeValue');
					expect(Array.from(Array.from(Array.from(track.childNodeTracks.values())[1].childNodeTracks.values())[0].childNodeTracks.values())[0].tracks.property[0].value).toBe('{sample}');
					// track 3
					expect(Array.from(track.childNodeTracks.values())[2].tracks.property.length).toBe(1);
					expect(Array.from(track.childNodeTracks.values())[2].tracks.property[0].name).toBe('nodeValue');
					expect(Array.from(track.childNodeTracks.values())[2].tracks.property[0].value).toBe('{title}');
					// track 4
					expect(Array.from(track.childNodeTracks.values())[3].node.nodeName).toBe('ANOTHER-COMP');
					expect(Array.from(track.childNodeTracks.values())[3].tracks.directive.length).toBe(1);
					expect(Array.from(track.childNodeTracks.values())[3].tracks.directive[0].name).toBe('repeat');
					expect(Array.from(track.childNodeTracks.values())[3].childNodeTracks.size).toBe(1);
					expect(Array.from(Array.from(track.childNodeTracks.values())[3].childNodeTracks.values())[0].tracks.property.length).toBe(1);
					expect(Array.from(Array.from(track.childNodeTracks.values())[3].childNodeTracks.values())[0].tracks.property[0].name).toBe('nodeValue');
					expect(Array.from(Array.from(track.childNodeTracks.values())[3].childNodeTracks.values())[0].tracks.property[0].value).toBe('Lorem ipsum {$item}');
					// track 5
					expect(Array.from(track.childNodeTracks.values())[4].tracks.property.length).toBe(1);
					expect(Array.from(track.childNodeTracks.values())[4].tracks.property[0].name).toBe('nodeValue');
					expect(Array.from(track.childNodeTracks.values())[4].tracks.property[0].value).toBe('{sample}');

					done();
				})

				// @ts-ignore
				this.shadowRoot.appendChild(frag);
			}
		}

		customElements.define('sample-comp', Comp);

		document.body.innerHTML = `<sample-comp><span>{sample}</span></sample-comp>`
	});
});

describe('NodeTrack', () => {
	it('should handle text node', () => {
		const node = document.createTextNode('{sample}');

		document.body.appendChild(node);

		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		$.get(node).updateContext({'sample': 200});

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

		$.get(node).updateContext({'sample': true});

		expect(document.body.innerHTML).toBe('<div>content</div>');

		$.get(node).updateContext({'sample': false});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<!-- if: false -->');

		$.get(node).updateContext({'sample': true});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div>');
	});

	it('should handle directive with array of node anchors', () => {
		const node = document.createElement('div');
		node.textContent = 'content'
		node.setAttribute('repeat', 'count');

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		$.get(node).updateContext({'count': 2});

		expect(document.body.innerHTML).toBe('<div>content</div>');

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div><div>content</div>');

		$.get(node).updateContext({'count': 1});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div>');

		$.get(node).updateContext({'count': 0});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<!--<div>content</div>-->');

		$.get(node).updateContext({'count': 1});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div>');

		$.get(node).updateContext({'count': 2});
		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div>content</div><div>content</div>');
	});

	it('should handle attribute track', () => {
		const node = document.createElement('div');
		node.textContent = 'content'
		node.setAttribute('class', '{cls}');

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		$.get(node).updateContext({'cls': 'box'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div class="box">content</div>');
	});

	it('should handle property track', () => {
		const node = document.createElement('textarea');
		node.textContent = '{val}'

		document.body.appendChild(node);
		const nt = new NodeTrack(node, comp, trackNode(node, comp));

		$.get(node).updateContext({'val': 'some text'});

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

		$.get(node).updateContext({cls: 'box', content: 'some content'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div class="box">some content</div>');

		$.get(node).updateContext({content: 'diff content'});

		nt.updateNode();

		expect(document.body.innerHTML).toBe('<div class="box">diff content</div>');
	});
})