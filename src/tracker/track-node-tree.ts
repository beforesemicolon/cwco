import {CWCO} from "../cwco";
import {$} from "../core/metadata";
import {slotTag} from "../tags/slot.tag";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";
import {NodeTrack} from "./node-track";
import {trackNode} from "./track-node";

export const trackNodeTree = (node: Node | CWCO.WebComponent | HTMLElement, ancestorNodeTrack: NodeTrack, component: CWCO.WebComponent) => {
	const {nodeName, nodeValue, childNodes, nodeType} = node;

	// if the track already exist simply push it to the ancestor
	if ($.get(node)?.track) {
		ancestorNodeTrack.childNodeTracks.add($.get(node)?.track);
		return;
	}

	// skip comments and empty text nodes to save unnecessary processing
	if (nodeName === '#comment' || (nodeName === '#text' && !nodeValue?.trim())) {
		return;
	}

	if (nodeName === 'SLOT') {
		slotTag(node as HTMLSlotElement, {
			component: {
				type: component.customSlot ? 'context' : 'default',
				childNodes: component._childNodes
			}
		}, (nodes: Node[]) => {
			nodes.forEach(node => {
				trackNodeTree(node, ancestorNodeTrack, component);
			})
		})
	} else if ((nodeType === 1 || nodeType === 3)) {
		defineNodeContextMetadata(node);
		const tracks = trackNode(node, component);
		const isComponentNode = nodeName.includes('-');

		// collect the node track if it is a web component node
		// ,or it is just a node with tracks;
		if (isComponentNode || (tracks.attribute.length || tracks.property.length || tracks.directive.length)) {
			const nodeTrack = new NodeTrack(node, component, tracks);
			$.get(node).track = nodeTrack;
			ancestorNodeTrack.childNodeTracks.add(nodeTrack);
			ancestorNodeTrack = nodeTrack; // continue collecting for this node track
		}

		// no need to continue for inside these tags either because:
		// - contains content which we don't want to deal with (script)
		// - content is already handled by the "trackNode" function
		if (/SCRIPT|STYLE|TEXTAREA|#text/i.test(nodeName)) {
			return;
		}
	}

	Array.from(childNodes).forEach(c => trackNodeTree(c, ancestorNodeTrack, component));
}