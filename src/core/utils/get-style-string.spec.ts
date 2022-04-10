import {getStyleString} from './get-style-string';

describe('getStyleString', () => {
	const style = `
		:host {
			background: red;
		}
		
		:host ( .active ) {
			background: green;
		}
	`
	it('should return empty string if no style provided', () => {
		expect(getStyleString('', 'test-tag')).toEqual('')
	});

	it('should return css inside a style tag id by the tag name', () => {
		expect(getStyleString(style, 'test-tag', false)).toEqual('<style class="test-tag">test-tag { background: red; } test-tag.active { background: green; }</style>')
	});
	
	it('should keep css inside a style tag id by the tag name', () => {
		expect(getStyleString(`<style id="my-style">${style}</style>`, 'test-tag', false)).toEqual('<style id="my-style" class="test-tag"> test-tag { background: red; } test-tag.active { background: green; } </style>')
	});
	
	it('should keep only link stylesheets', () => {
		expect(getStyleString('<link rel="stylesheet" href="./some/stye.css"><link rel="icon" type="image/x-icon" href="/images/favicon.ico">', 'test-tag'))
			.toEqual('<link rel="stylesheet" href="./some/stye.css">')
	});
	
	it('should allow mix of link stylesheets and style', () => {
		expect(getStyleString(`
			<link rel="stylesheet" href="./some/stye.css">
			<link rel="icon" type="image/x-icon" href="/images/favicon.ico">
			${style}
			<style>
				:host {
					box-sizing: border-box;
				}
			</style>
`, 'test-tag'))
			.toEqual(
				'<link rel="stylesheet" href="./some/stye.css">' +
				'<style>  :host { background: red; } :host ( .active ) { background: green; } </style>' +
				'<style> :host { box-sizing: border-box; } </style>')
	});
	
	it('should replace :host with tag name if no shadow root', () => {
		expect(getStyleString(style, 'test-tag', false)).toEqual('<style class="test-tag">test-tag { background: red; } test-tag.active { background: green; }</style>')
	});
});
