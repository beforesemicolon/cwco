import selfClosingTags from './self-closing-tags.json';
import {CWCO} from "./../cwco";

const NSURI: CWCO.ObjectLiteral = {
	HTML: 'http://www.w3.org/1999/xhtml',
	SVG: 'http://www.w3.org/2000/svg',
}

export function parse(markup: string) {
	const tagCommentPattern = /<!--([^]*?)-->|<(\/|!)?([a-z][\w-.:]*)((?:\s*[a-z][\w-.:]*(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)+\s*|\s*)(\/?)>/ig;
	const root = document.createDocumentFragment();
	const stack: Array<DocumentFragment | HTMLElement | Element> = [root];
	let match: RegExpExecArray | null = null;
	let lastIndex = 0;
	let isNSTag = false
	let URI = ''

	while ((match = tagCommentPattern.exec(markup)) !== null) {
		let [fullMatch, comment, closeOrBangSymbol, tagName, attributes, selfCloseSlash] = match;

		tagName = tagName?.toUpperCase();

		if (closeOrBangSymbol === '!') {
			continue;
		}

		const parentNode = stack[stack.length - 1] || null;

		// grab in between text
		if (lastIndex !== match.index) {
			const textNode = document.createTextNode(markup.slice(lastIndex, match.index));
			parentNode.appendChild(textNode);
		}

		lastIndex = tagCommentPattern.lastIndex;

		if (comment) {
			const commentNode = document.createComment(comment);
			parentNode.appendChild(commentNode);
			continue;
		}

		isNSTag = isNSTag || /SVG|HTML/i.test(tagName);

		if (/SVG|HTML/i.test(tagName)) {
			URI = NSURI[tagName.toUpperCase()];
		}

		if (selfCloseSlash || (selfClosingTags as {[key: string]: string})[tagName]) {
			const node = isNSTag
				? document.createElementNS(URI, tagName.toLowerCase())
				: document.createElement(tagName);

			setAttributes(node, attributes)

			parentNode.appendChild(node);
		} else if (closeOrBangSymbol === '/') {
			isNSTag = /SVG|HTML/i.test(tagName) ? false : isNSTag;
			URI = /SVG|HTML/i.test(tagName) ? '' : URI;
			stack.pop();
		} else if (!closeOrBangSymbol) {
			const node = isNSTag
				? document.createElementNS(URI, tagName.toLowerCase())
				: document.createElement(tagName);

			setAttributes(node, attributes)

			parentNode.appendChild(node);

			stack.push(node)
		}
	}

	// grab ending text
	if (lastIndex < markup.length) {
		const textNode = document.createTextNode(markup.slice(lastIndex));
		root.appendChild(textNode);
	}

	return root;
}

function setAttributes(node: Element | HTMLElement, attributes: string) {
	const attrPattern = /([a-z][\w-.:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;
	let match: RegExpExecArray | null = null;

	while ((match = attrPattern.exec(attributes))) {
		let name = match[1];
		const value = match[2] || match[3] || match[4] || (
			new RegExp(`^${match[1]}\\s*=`).test(match[0]) ? '' : null
		)

		node.setAttribute(name, value ?? '');
	}
}
