export const replaceHost = (css: string, tagName: string) => css.replace(/:(host-context|host)(?:\s*\((.*?)\))?/gmi, (_, h, s) => {
	if (h === 'host-context') {
		return `${(s || '').trim()} ${tagName}`;
	}
	
	return `${tagName}${(s || '').trim()}`;
})
