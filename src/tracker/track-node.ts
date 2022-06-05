import {CWCO} from "../cwco";
import {$} from "../core/$";
import {extractExecutableSnippetFromCSS} from "./utils/extract-executable-snippet-from-css";
import {directiveRegistry} from "../directives/registry";
import {parseNodeDirective} from "./utils/parse-node-directive";
import {getEventHandlerFunction} from "./utils/get-event-handler-function";
import {extractExecutableSnippetFromString} from "./utils/extract-executable-snippet-from-string";
import {TrackType} from "../enums/track-type";
import {Track} from "./track";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";

export const trackNode = (node: Node | HTMLElement, component: CWCO.WebComponent): CWCO.TracksMapByType => {
	const tracks: CWCO.TracksMapByType = {
		directive: [],
		attribute: [],
		property: [],
	};

	defineNodeContextMetadata(node)
	// because there are certain actions here that will modify the node itself like removing attributes
	// we can preserve the original node string representation to recreate it if necessary later
	$.get(node).rawNodeString = (node.nodeType === 3 ? node.nodeValue : (node as HTMLElement).outerHTML) || '';

	let {nodeName, nodeValue, nodeType, textContent, attributes} = node as HTMLElement;
	let track = null;
	nodeValue = nodeValue || '';
	textContent = textContent || '';

	switch (nodeName) {
		case '#text':
			track = getNodeTrack('nodeValue', nodeValue)
			if (track) {
				tracks.property.push(track);
			}
			break;
		case 'TEXTAREA':
			track = getNodeTrack('textContent', textContent)
			if (track) {
				tracks.property.push(track);
			}
			break;
		case 'STYLE':
			track = getNodeTrack('textContent', textContent, TrackType.property, extractExecutableSnippetFromCSS)
			if (track) {
				tracks.property.push(track);
			}
			break;
	}

	if (nodeType === 1) {
		const dirPattern = new RegExp(`^(${Object.keys(directiveRegistry).join('|')})\\.?`);
		const eventHandlers: Array<CWCO.EventHandlerTrack> = [];
		const attrs: Attr[] = [];

		// @ts-ignore
		[...attributes].forEach((attr, i) => {
			if (dirPattern.test(attr.name)) {
				const {name, value, prop} = parseNodeDirective(node as HTMLElement, attr.name, attr.value);
				const dir = directiveRegistry[name];

				track = new Track(name, value, TrackType.directive);
				track.prop = prop;
				track.handler = dir;

				if(name === 'if') {
					tracks.directive[0] = track;
				} else if(name === 'repeat') {
					tracks.directive[1] = track;
				} else {
					tracks.directive[i + 2] = track;
				}

				(node as HTMLElement).removeAttribute(attr.name);
			} else if (attr.name.startsWith('on')) {
				eventHandlers.push({
					eventName: attr.name.slice(2).toLowerCase(),
					attribute: attr
				});
			} else {
				attrs.push(attr)
			}
		})

		tracks.directive = Object.values(tracks.directive); // to eliminate empty slots

		eventHandlers.forEach(({eventName, fn, attribute}) => {
			(node as HTMLElement).removeAttribute(attribute.name);

			if (!fn) {
				node.addEventListener(eventName, getEventHandlerFunction(component, node, attribute));
			}
		});

		for (let attr of attrs) {
			if (attr.value.trim()) {
				track = getNodeTrack(attr.name, attr.value, TrackType.attribute)
				if (track) {
					tracks.attribute.push(track);
				}
			}
		}
	}

	return tracks;
}

function getNodeTrack(name: string, value: string, type: TrackType = TrackType.property, extractor = extractExecutableSnippetFromString) {
	if ((value || '').trim()) {
		const track = new Track(name, value, type);
		track.executables = extractor(value);

		if (track.executables.length) {
			return track;
		}
	}

	return null;
}
