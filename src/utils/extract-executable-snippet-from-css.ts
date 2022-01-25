import {CWCO} from "../cwco";
import {extractExecutableSnippetFromString} from "./extract-executable-snippet-from-string";

export function extractExecutableSnippetFromCSS(
	css: string,
) {
	const pattern = /[\{\}]/g;
	let snippets: CWCO.Executable[] = [];
	const stack: number[] = [];
	let match;

	while ((match = pattern.exec(css)) !== null) {
		const char = match[0];

		if (char === '{') {
			stack.push(match.index);
		} else if(char === '}') {
			if (stack.length === 1) {
				snippets.push(
					...extractExecutableSnippetFromString(
						css.slice(stack[0], match.index),
						['[', ']'],
						stack[0]
					)
				)
			}

			stack.pop();
		}
	}

	return snippets;
}
