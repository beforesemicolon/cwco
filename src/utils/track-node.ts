import {$} from "../metadata";
import {NodeTrack} from "../node-track";
import {defineNodeContextMetadata} from "./define-node-context-metadata";
import {slotTag} from "../tags/slot.tag";

export function trackNode(node: Node | HTMLElement | DocumentFragment, component: WebComponent, opt: trackerOptions) {
	const {nodeName, nodeValue, childNodes, nodeType} = node;

	if ($.get(node)?.tracked || (nodeName === '#text' && !nodeValue?.trim())) {
		return;
	}

	defineNodeContextMetadata(node);
	$.get(node).tracked = true;

	if (/#comment|SCRIPT/.test(nodeName)) {
		return;
	}

	let {trackOnly = false, tracks} = opt
	
	if (nodeName === 'SLOT') {
		slotTag(node as HTMLElement, {
			component: {
				type: component.customSlot ? 'context' : 'default',
				childNodes: component._childNodes
			}
		}, (nodes: Node[]) => {
			nodes.forEach(node => {
				trackNode(node, component, opt);
			})
		})
	} else {
		// avoid fragments
		if (nodeType !== 11) {
			if (nodeType === 1 || nodeName === '#text') {
				const track: NodeTrack = new NodeTrack(node, component);
				if (!track.empty) {
					$.get(node).track = track;
					tracks.set(node, track);

					if (!trackOnly) {
						const res = track.updateNode();
						if (res !== node) {
							trackOnly = true;

							if (Array.isArray(res)) {
							   return;
							}
						}
					}

					tracks = track.tracks;
				}
			}
			
			if (/#text|TEXTAREA|STYLE/.test(nodeName)) {
				return;
			}
		}

		Array.from(childNodes).forEach(c => trackNode(c, component, {...opt, trackOnly, tracks}));
	}
}
