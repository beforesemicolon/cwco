import {CWCO} from "../cwco";

export const slotTag = (node: HTMLSlotElement, {component}: CWCO.ObjectLiteral = {}, cb: (n: Node[]) => void): void => {
	let nodes: Node[] = [];
	
	if (component.type === 'context') {
		nodes = renderCustomSlot(node, component.childNodes)
	} else {
		nodes = getSlotAssignedNodes(component.childNodes, node.getAttribute('name') || '')
	}
	
	cb(nodes);
}

function renderCustomSlot(node: HTMLSlotElement, childNodes: Array<Node>) {
	const name = node.getAttribute('name') || '';
	let nodeList = getSlotAssignedNodes(childNodes, name);
	let comment = document.createComment(`slotted [${name || ''}]`);
	node.parentNode?.replaceChild(comment, node);
	
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

function getSlotAssignedNodes(childNodes: Array<Node> = [], name: string = ''): Node[] {
	if (name) {
		return childNodes.filter(n => {
			return n.nodeType === 1 && (n as HTMLElement).getAttribute('slot') === name;
		});
	}
	
	return childNodes.filter(n => {
		return n.nodeType !== 1 || !(n as HTMLElement).hasAttribute('slot');
	});
}

