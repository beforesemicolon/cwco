import {CWCO} from "../../cwco";

export function extractExecutableSnippetFromString(str: string, [start, end] = ['{', '}'], offset = 0) {
	const stack = [];
	const pattern = new RegExp(`[\\${start}\\${end}]`, 'g');
	let snippets: CWCO.Executable[] = [];
	let match;
	let startingCurlyIndex: number;

	while ((match = pattern.exec(str)) !== null) {
		const char = match[0];

		if (char === start) {
			stack.push(match.index);
		} else if (char === end && stack.length) {
			startingCurlyIndex = stack.pop() as number;

			if(!stack.length) {
				const matchStr = str.slice(startingCurlyIndex + 1, match.index);

				if (matchStr) {
					for (let j = 0; j < snippets.length; j++) {
						const snippet = snippets[j];

						if ((snippet.from - offset) > startingCurlyIndex && (snippet.to - offset) < match.index) {
							snippets.splice(j, 1)
						}
					}

					snippets.push({
						from: startingCurlyIndex + offset,
						to: match.index + offset,
						match: `${start}${matchStr}${end}`,
						executable: matchStr
					});
				}
			}
		}
	}

	return snippets;
}
