export const convertHtmlEntities = (str: string) => str
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&amp;/g, '&')
	.replace(/&quot;/g, '"')