import {parse} from "../parser/parse";
import {WebComponent} from "../core/web-component";
import {NodeTrack} from "./node-track";
import {trackNodeTree} from "./track-node-tree";

describe('trackNodeTree', () => {
	class CompBase extends WebComponent {}
	CompBase.register();
	const comp = new CompBase();

	it('should track parsed html', () => {
		class Comp extends HTMLElement {
			constructor() {
				super();

				this.attachShadow({mode: 'open'});

				const frag = parse(
					'<style if="withStyle">{:host {display: [display]}}</style>' + // track 1 > 1
					'<some-comp>' +
						'<div attr.data.sample="12">' + // track 2 > 1
							'{sample}' +
						'</div>' +
					'</some-comp>' +
					'<section>' +
						'<h2>{title}</h2>' + // track 3
						'<another-comp repeat="2">' + // track 4 > 1
								'Lorem ipsum {$item}' +
						'</another-comp>' +
						'<slot></slot>' + // track 5
					'</section>');
				
				comp._childNodes = Array.from(this.childNodes);
				const track = new NodeTrack(this, comp);

				expect(track.childNodeTracks.size).toBe(0);

				trackNodeTree(frag, track, comp);

				// @ts-ignore
				this.shadowRoot.appendChild(frag);
				
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
			}
		}

		customElements.define('sample-comp', Comp);

		document.body.innerHTML = `<sample-comp><span>{sample}</span></sample-comp>`
	});
});
