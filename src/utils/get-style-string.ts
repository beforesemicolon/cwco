export function getStyleString(stylesheet: string, tagName: string, hasShadowRoot: boolean = true) {
	stylesheet = stylesheet.trim().replace(/\s{2,}/g, ' ');

	if (!stylesheet) {
	    return '';
	}

	const div = document.createElement('div');

	div.innerHTML = stylesheet;
	const styleTag = document.createElement('style');

	const linkElements: HTMLLinkElement[] = []

	Array.from(div.childNodes).forEach(child => {
		if (child.nodeName === 'LINK' && ((child as HTMLLinkElement).getAttribute('rel') || '').trim() === 'stylesheet') {
			linkElements.push(child as HTMLLinkElement);
		} else if (child.nodeName === 'STYLE') {
			styleTag.appendChild(child.childNodes[0]);
		} else if(child.nodeName === '#text') {
			styleTag.appendChild(child);
		}
	});

	if (!hasShadowRoot) {
		styleTag.classList.add(tagName);
		styleTag.textContent = (styleTag.innerHTML).replace(/(:host)(?:\s*\((.*)\))?\s*{/gsi, (_, h, s) => {
			return `${tagName}${(s || '').trim()} {`;
		})
	}

	return (styleTag.innerHTML.trim() && styleTag.outerHTML) + linkElements.map(link => link.outerHTML).join('');
}
