import {proxify} from './proxify';
import boolAttr from './boolean-attributes.json';
import {directives} from "../directives";
import {jsonParse} from "./json-parse";
import {$} from "../metadata";
import {CWCO} from "../cwco";

export function setComponentPropertiesFromObservedAttributes(
	comp: CWCO.WebComponent,
	attrs: string[],
	attrsMap: CWCO.ObjectLiteral = {},
	cb: CWCO.onUpdateCallback
): string[] {
	const properties: string[] = [];

	attrs.forEach(attr => {
		attr = attr.trim();

		if (!directives.has(attr) && !(attr.startsWith('data-') || attr === 'class' || attr === 'style')) {
			let prop = attrsMap[attr];
			let value: any = comp[prop] ?? comp.getAttribute(attr) ?? '';

			properties.push(prop);

			value = proxify(prop, jsonParse(value), (name, val) => {
				cb(name, val, val);
			});
			
			if ((boolAttr).hasOwnProperty(prop)) {
				value = comp.hasAttribute(attr);
				prop = (boolAttr as CWCO.booleanAttributes)[prop].name;
			}

			if (value && typeof value === 'object') {
				comp.removeAttribute(attr);
			}

			Object.defineProperty(comp, prop, {
				get() {
					return value;
				},
				set(newValue) {
					if (comp.hasAttribute(attr) && typeof newValue === 'object') {
						$.get(comp).clearAttr = true;
						comp.removeAttribute(attr);
					}

					if (value !== newValue) {
						const oldValue = value;
						value = proxify(prop, newValue, () => {
							cb(prop, oldValue, value);
						});
						cb(prop, oldValue, newValue);
					}
				}
			})
		}
	})

	return properties;
}
