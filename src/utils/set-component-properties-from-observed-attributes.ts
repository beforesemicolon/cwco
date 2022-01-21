import {proxify} from './proxify';
import boolAttr from './boolean-attributes.json';
import {directives} from "../directives";
import {jsonParse} from "./json-parse";
import {$} from "../metadata";
import {CWCO} from "../cwco";
import {isPrimitive} from "./is-primitive";

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
			let value: any = (comp.getAttribute(attr) ?? comp[prop]) ?? '';

			properties.push(prop);

			if ((boolAttr).hasOwnProperty(prop)) {
				value = comp.hasAttribute(attr);
				prop = (boolAttr as CWCO.booleanAttributes)[prop].name;
			}

			Object.defineProperty(comp, prop, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;

					if (!isPrimitive(newValue)) {
						if (comp.hasAttribute(attr)) {
							$.get(comp).clearAttr = true;
							comp.removeAttribute(attr);
						}

						value = proxify(prop, newValue, () => {
							cb(prop, oldValue, newValue);
						});

						cb(prop, oldValue, value);
					} else if(oldValue !== newValue) {
						value = newValue;
						cb(prop, oldValue, value);
					}
				}
			})
		}
	})

	return properties;
}
