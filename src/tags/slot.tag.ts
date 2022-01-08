import {CWCO} from "../cwco";

export const slotTag = (node: HTMLElement, {component}: CWCO.ObjectLiteral = {}, cb: (n: Node[]) => void): void => {
	if (component.type === 'context') {
		cb(renderCustomSlot(node, component.childNodes));
	} else {
		renderSlot(node, cb);
	}
}

function renderSlot(node: HTMLElement, cb: (c: Node[]) => void) {
	const onSlotChange = () => {
		const nodes = (node as HTMLSlotElement).assignedNodes();
		
		cb(nodes);
		
		node.removeEventListener('slotchange', onSlotChange, false);
	};
	
	node.addEventListener('slotchange', onSlotChange, false);
	
	cb(Array.from(node.childNodes));
}

function renderCustomSlot(node: HTMLElement, childNodes: Array<Node>) {
	const name = node.getAttribute('name');
	let nodeList: Node[];
	let comment = document.createComment(`slotted [${name || ''}]`);
	node.parentNode?.replaceChild(comment, node);
	
	if (name) {
		nodeList = childNodes.filter(n => {
			return n.nodeType === 1 && (n as HTMLElement).getAttribute('slot') === name;
		});
	} else {
		nodeList = childNodes.filter(n => {
			return n.nodeType !== 1 || !(n as HTMLElement).hasAttribute('slot');
		});
	}
	
	if (!nodeList.length) {
		nodeList = Array.from(node.childNodes);
	}
	
	let anchor: Node = comment;
	
	for (let n of nodeList) {
		(anchor as Element).after(n);
		anchor = n;
	}
	
	comment.parentNode?.removeChild(comment);
	
	return nodeList;
}
