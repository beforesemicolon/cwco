export function getStyleString(stylesheet: string, tagName: string, hasShadowRoot: boolean = true) {
	stylesheet = stylesheet.trim().replace(/\s{2,}/g, ' ');

	if (!stylesheet) {
	    return '';
	}

	let style = stylesheet.startsWith('<style')
		? stylesheet
		: `<style>${stylesheet}</style>`;

	const div = document.createElement('div');

	if (!hasShadowRoot) {
		style = style.replace(/(:host)((\s*\(.*\)|))?/g, (_, h, s) => {
			if (s) {
				return tagName + s.trim().slice(1, -1).trim();
			}
			return tagName;
		})
	}

	div.innerHTML = style;

	Array.from(div.children).forEach(child => {
		child.className = tagName;
	});

	return div.innerHTML;
}
