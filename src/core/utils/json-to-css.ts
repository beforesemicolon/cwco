import {CWCO} from "../../cwco";
import {turnCamelToKebabCasing} from "../../utils/turn-camel-to-kebab-casing";

type callback = (str: string | null, declaration?: string) => void

export function JSONToCSS(obj: CWCO.ObjectLiteral) {
	return Object.keys(obj).map(prop => createPropertyBody(prop, obj[prop])).join('').trim();
}

function getPropertyCSS(prop: string, value: CWCO.StylesheetObject, parentProp: string, cb: callback) {
	prop = prop.trim();
	
	if(prop.startsWith('&')) {
		cb(null, createPropertyBody(prop.replace(/&/g, parentProp), value));
	} else if(prop.startsWith('@')) {
		cb(null, createPropertyBody(prop, value))
	} else if(typeof value === 'object') {
		if (parentProp.startsWith('@')) {
			cb(createPropertyBody(prop, value))
		} else if(/^[^+~>]/i.test(prop)) {
			cb(null, createPropertyBody(`${parentProp} ${prop}`, value))
		}
	} else {
		cb(`${turnCamelToKebabCasing(prop)}: ${value};`);
	}
}

function createPropertyBody(prop: string, value: CWCO.ObjectLiteral): string {
	const declarations = [];
	let declaration = `${prop} {`;
	
	Object.keys(value).forEach(childProp => getPropertyCSS(childProp, value[childProp], prop, (pair, newDeclaration = '') => {
		if(pair) {
			declaration += pair;
		} else {
			declarations.push(newDeclaration);
		}
	}));
	
	declaration += '} ';
	
	declarations.unshift(declaration);
	
	return declarations.join('');
}
