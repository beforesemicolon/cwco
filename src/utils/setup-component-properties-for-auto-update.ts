import {turnCamelToKebabCasing} from "./turn-camel-to-kebab-casing";
import {directives} from "../directives";
import {proxify} from "./proxify";
import {CWCO} from "../cwco";

export function setupComponentPropertiesForAutoUpdate(component: CWCO.WebComponent, onUpdate: CWCO.onUpdateCallback): string[] {
	const properties: string[] = [];

	for (let property of Object.getOwnPropertyNames(component)) {
		const attr = turnCamelToKebabCasing(property);

		// ignore private properties and $ properties as well as attribute properties
		if (!directives.has(property) && !/\$|_/.test(property[0]) && !(component.constructor as CWCO.WebComponentConstructor).observedAttributes.includes(attr)) {
			// @ts-ignore
			let value = component[property];

			properties.push(property);

			value = proxify(property, value, () => {
				onUpdate(property, value, value);
			})

			Object.defineProperty(component, property, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;
					value = proxify(property, newValue, () => {
						onUpdate(property, oldValue, value);
					});

					if (newValue !== oldValue) {
						onUpdate(property, oldValue, newValue);
					}
				}
			})
		}
	}

	return properties;
}
