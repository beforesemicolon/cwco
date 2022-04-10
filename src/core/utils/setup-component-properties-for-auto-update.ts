import {turnCamelToKebabCasing} from "../../utils/turn-camel-to-kebab-casing";
import {directives} from "../../directives";
import {proxify} from "../../utils/proxify";
import {CWCO} from "../../cwco";
import {isPrimitive} from "../../utils/is-primitive";

export function setupComponentPropertiesForAutoUpdate(comp: CWCO.WebComponent, onUpdate: CWCO.onUpdateCallback): string[] {
	const properties: string[] = [];

	for (let prop of Object.getOwnPropertyNames(comp)) {
		// should not watch function properties
		if (typeof comp[prop] === 'function') {
			break;
		}
		
		const attr = turnCamelToKebabCasing(prop);

		// ignore private properties and $ properties as well as attribute properties
		if (!directives.has(prop) && !/\$|_/.test(prop[0]) && !(comp.constructor as CWCO.WebComponentConstructor).observedAttributes.includes(attr)) {
			// @ts-ignore
			let value = comp[prop];
			
			properties.push(prop);

			value = proxify(prop, value, () => {
				onUpdate(prop, value, value);
			})

			Object.defineProperty(comp, prop, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;

					if (!isPrimitive(newValue)) {
						value = proxify(prop, newValue, () => {
							onUpdate(prop, oldValue, newValue);
						});
						onUpdate(prop, oldValue, value);
					} else if(oldValue !== newValue) {
						value = newValue;
						onUpdate(prop, oldValue, value);
					}
				}
			})
		}
	}

	return properties;
}
