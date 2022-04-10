import {CWCO} from "../../cwco";
import {turnCamelToKebabCasing} from "../../utils/turn-camel-to-kebab-casing";

type callback = (str: string | null, declaration?: string[]) => void

export function JSONToCSS(obj: CWCO.StylesheetObject) {
	return Object.keys(obj).map(prop => createPropertyBody(prop, obj[prop])).join('\n')
}

function getPropertyCSS(prop: string, value: CWCO.StylesheetObject, parentProp: string, cb: callback) {
	prop = prop.trim();
	
	if(prop.startsWith('&')) {
		cb(null, createPropertyBody(parentProp + prop.slice(1), value));
	} else if(prop.startsWith('@')) {
		cb(null, createPropertyBody(prop, value))
	} else if(typeof value === 'object') {
		cb(createPropertyBody(prop, value).join('\n'))
	} else {
		cb(`\n${turnCamelToKebabCasing(prop)}: ${value};`);
	}
}

function createPropertyBody(prop: string, value: CWCO.StylesheetObject): string[] {
	const declarations = [];
	let declaration = `\n${prop} {`;
	
	Object.keys(value).forEach(childProp => getPropertyCSS(childProp, value[childProp], prop, (pair, newDeclaration = []) => {
		if(pair) {
			declaration += pair;
		} else {
			declarations.push(newDeclaration);
		}
	}));
	
	declaration += '\n}';
	
	declarations.unshift(declaration);
	
	return declarations;
}
