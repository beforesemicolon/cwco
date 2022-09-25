import {replaceHost} from "./replace-host";

export function getStyleString(stylesheet: string, tagName: string, hasShadowRoot: boolean = true) {
	stylesheet = stylesheet.trim().replace(/\s{2,}/g, ' ');

	if (!stylesheet) {
	    return '';
	}

	const div = document.createElement('div');

	div.innerHTML = stylesheet;
	const styleTag = document.createElement('style');
	const links: HTMLLinkElement[] = []
	const styles: HTMLStyleElement[] = [styleTag]

	Array.from(div.childNodes).forEach(child => {
		if (child.nodeName === 'LINK' && ((child as HTMLLinkElement).getAttribute('rel') || '').trim() === 'stylesheet') {
			links.push(child as HTMLLinkElement);
		} else if (child.nodeName === 'STYLE') {
			styles.push(child as HTMLStyleElement);
		} else if(child.nodeName === '#text') {
			styleTag.appendChild(child);
		}
	});

	if (!hasShadowRoot) {
		links.forEach(link => {
			link.classList.add(tagName);
		})
		
		for (let style of styles) {
			style.classList.add(tagName);
			style.textContent = replaceHost(style.innerHTML, tagName);
		}
	}

	return links.map(el => el.outerHTML).join('') + styles.filter(el => (el.textContent || '').trim()).map(el => el.outerHTML).join('');
}
