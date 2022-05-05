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
			continue;
		}
		
		if (
			!directives.has(prop) && // cannot be a directive
			!comp.$properties.includes(prop) && // cannot be default properties of the component
			!(comp.constructor as CWCO.WebComponentConstructor).observedAttributes.includes(turnCamelToKebabCasing(prop)) // cannot be one of the attributes
		) {
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
					
					// in case a property becomes a function later
					// we don't want to handle it as a property
					if (typeof newValue !== 'function') {
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
				}
			})
		}
	}

	return properties;
}
