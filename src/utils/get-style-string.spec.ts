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
		expect(getStyleString(style, 'test-tag')).toEqual('<style class="test-tag">:host { background: red; } :host ( .active ) { background: green; }</style>')
	});

	it('should replace :host with tag name if no shadow root', () => {
		expect(getStyleString(style, 'test-tag', false)).toEqual('<style class="test-tag">test-tag { background: red; } test-tag.active { background: green; }</style>')
	});
});