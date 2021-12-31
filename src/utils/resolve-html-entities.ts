export function resolveHtmlEntities(html: string): string {
	const e = document.createElement('textarea');
	e.innerHTML = html;
	return e.textContent || '';
}