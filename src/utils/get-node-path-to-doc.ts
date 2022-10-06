import {getParent} from "./get-parent";

export const getNodePathToDoc = (node: Node): string[] => {
	const parent = getParent(node);
	
	if (parent && parent.nodeName !== 'BODY' && parent.nodeName !== 'HEAD') {
		return [...getNodePathToDoc(parent), node.nodeName]
	}
	
	return [node.nodeName];
}
