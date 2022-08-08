import {directiveRegistry} from "../directives/registry";
import {WebComponent} from "../core/web-component";
import {trackNode} from "./track-node";
import {TrackType} from "../enums/track-type";
import {Track} from "./track";

describe('trackNode', () => {
	class CompBase extends WebComponent {}
	CompBase.register();
	const comp = new CompBase();

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