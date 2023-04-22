import {Directive} from "../core/Directive";
import {turnKebabToCamelCasing} from "../utils/turn-kebab-to-camel-casing";
import {turnCamelToKebabCasing} from "../utils/turn-camel-to-kebab-casing";
import booleanAttr from "../core/boolean-attributes.json";
import {CWCO} from "../cwco";

export class Attr extends Directive {
	parseValue(value: string, prop: string | null): string {
		let [attrName, property = null] = (prop ?? '').split('.');
		const commaIdx = value.lastIndexOf(',');

		return `["${attrName}", "${property || ''}", ${commaIdx >= 0 ? value.slice(commaIdx + 1).trim() : value}, "${commaIdx >= 0 ? value.slice(0, commaIdx).trim() : ''}"]`;
	}

	render([attrName, property, shouldAdd, val]: any, {element}: CWCO.directiveRenderOptions): HTMLElement {
		switch (attrName) {
			case 'style':
				if (property) {
					property = turnKebabToCamelCasing(property);

					element.style[property] = shouldAdd ? val : '';
				} else {
					val
						.match(/([a-z][a-z-]+)(?=:):([^;]+)/g)
						?.forEach((style: string) => {
							let [name, styleValue] = style.split(':').map(s => s.trim());

							if (shouldAdd) {
								element.style.setProperty(name, styleValue);
							} else {
								element.style.removeProperty(name);
							}
						})
				}

				break;
			case 'class':
				if (property) {
					if (shouldAdd) {
						element.classList.add(property);
					} else {
						element.classList.remove(property);
					}
				} else {
					const classes = val.split(/\s+/g);

					if (shouldAdd) {
						classes.forEach((cls: string) => element.classList.add(cls));
					} else {
						classes.forEach((cls: string) => element.classList.remove(cls));
					}
				}
				break;
			case 'data':
				if (property) {
					if (shouldAdd) {
						element.dataset[turnKebabToCamelCasing(property)] = val;
					} else {
						element.removeAttribute(`data-${turnCamelToKebabCasing(property)}`)
					}
				}
				break;
			default:
				if (attrName) {
					if (shouldAdd) {
						element.setAttribute(attrName,
							booleanAttr.hasOwnProperty(attrName) ? '' : `${val || shouldAdd}`);
					} else {
						element.removeAttribute(attrName);
					}
				}
		}

		return element;
	}
}
