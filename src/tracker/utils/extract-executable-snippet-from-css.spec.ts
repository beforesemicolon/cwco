import {extractExecutableSnippetFromCSS} from "./extract-executable-snippet-from-css";

describe('extractExecutableSnippetFromCSS', () => {
	it('should extract executables from CSS values', () => {
		expect(extractExecutableSnippetFromCSS(`
			:host {
				--font-family: [this.font?.family];
				--font-size-h6: [this.theme.font?.size.headings['h6']];
				background: [colors.bg]
			}
		
			:host *,
			:host *::before,
			:host *::after {
				box-sizing: border-box;
			}
			
			:host-context(h1) {
			  font-weight: bold;
			}
			
			:host .btn.btn-outline {
				background: none;
				color: [this.theme.colors.red];
				border: 1px solid [this.theme.colors.red];
				font-weight: 700;
			}
			
			:host-context(main article) {
			  font-weight: bold;
			}
			
			:host(.active) {
				background: [colors.active] url('./sample.png') no-repeat;
				color: [colors.dark];
			}
		`))
			.toEqual([
				{
					"executable": "this.font?.family",
					"from": 31,
					"match": "[this.font?.family]",
					"to": 49
				},
				{
					"executable": "this.theme.font?.size.headings['h6']",
					"from": 72,
					"match": "[this.theme.font?.size.headings['h6']]",
					"to": 109
				},
				{
					"executable": "colors.bg",
					"from": 128,
					"match": "[colors.bg]",
					"to": 138
				},
				{
					"executable": "this.theme.colors.red",
					"from": 354,
					"match": "[this.theme.colors.red]",
					"to": 376
				},
				{
					"executable": "this.theme.colors.red",
					"from": 401,
					"match": "[this.theme.colors.red]",
					"to": 423
				},
				{
					"executable": "colors.active",
					"from": 559,
					"match": "[colors.active]",
					"to": 573
				},
				{
					"executable": "colors.dark",
					"from": 617,
					"match": "[colors.dark]",
					"to": 629
				}
			])
	});

	it('should extract executables from CSS property body', () => {
		expect(extractExecutableSnippetFromCSS(`
		[colors.length]
		:host {
			[colors.map(c => '--sample-' + c.name + ': ' + c.value + ';\n')]
		}
		`))
			.toEqual([
				{
					"executable": "colors.map(c => '--sample-' + c.name + ': ' + c.value + ';\n')",
					"from": 32,
					"match": "[colors.map(c => '--sample-' + c.name + ': ' + c.value + ';\n')]",
					"to": 94
				}
			])
	});

	it('should extract executables with curly braces', () => {
		expect(extractExecutableSnippetFromCSS(`
		:host {
			value: [({name: ['good']}).name[0]]
		}
		`))
			.toEqual([
				{
					"executable": "({name: ['good']}).name[0]",
					"from": 21,
					"match": "[({name: ['good']}).name[0]]",
					"to": 48
				}
			])
	});

	it('should extract executables in nested body', () => {
		expect(extractExecutableSnippetFromCSS(`
		:host {
			value: [({name: 'good'}).name];
			
			& button {
				--font-family: [this.font?.family];
				--font-size-h6: [this.theme.font?.size.headings['h6']];
				background: [colors.bg]
			}

		}
		`))
			.toEqual([
				{
					"executable": "({name: 'good'}).name",
					"from": 21,
					"match": "[({name: 'good'}).name]",
					"to": 43
				},
				{
					"executable": "this.font?.family",
					"from": 83,
					"match": "[this.font?.family]",
					"to": 101
				},
				{
					"executable": "this.theme.font?.size.headings['h6']",
					"from": 124,
					"match": "[this.theme.font?.size.headings['h6']]",
					"to": 161
				},
				{
					"executable": "colors.bg",
					"from": 180,
					"match": "[colors.bg]",
					"to": 190
				}
			])
	});
});