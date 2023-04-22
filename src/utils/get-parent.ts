export const getParent = (node: Node) => {
	return node.parentNode instanceof ShadowRoot
		? node.parentNode.host
		: node.parentNode
}
