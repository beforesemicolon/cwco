export const slotTag = (node: HTMLElement, {component}: ObjectLiteral = {}, cb: (n: Node[]) => void): void => {
	const attrs = Array.from(node.attributes);
	
	if (component.type === 'context') {
		cb(renderCustomSlot(node, component.childNodes, attrs));
	} else {
		renderSlot(node, attrs, cb);
	}
}

function renderSlot(node: HTMLElement, attrs: Attr[], cb: (c: Node[]) => void) {
	const onSlotChange = () => {
		const nodes = (node as HTMLSlotElement).assignedNodes();
		
		nodes.forEach((n) => {
			if (n.nodeType === 1) {
				attrs.forEach(({name, value}) => name !== 'name' && (n as HTMLElement).setAttribute(name, value));
			}
		});
		
		cb(nodes);
		
		node.removeEventListener('slotchange', onSlotChange, false);
	};
	
	node.addEventListener('slotchange', onSlotChange, false);
	
	cb(Array.from(node.childNodes));
}

function renderCustomSlot(node: HTMLElement, childNodes: Array<Node>, attrs: Array<Attr>) {
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
		if (n.nodeType === 1) {
			attrs.forEach(a => a.name !== 'name' && (n as HTMLElement).setAttribute(a.name, a.value));
		}
		(anchor as Element).after(n);
		anchor = n;
	}
	
	comment.parentNode?.removeChild(comment);
	
	return nodeList;
}
