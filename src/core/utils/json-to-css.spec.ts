import {JSONToCSS} from './json-to-css';

describe('JSONToCSS', () => {
	it('should handle key-value pairs', () => {
		expect(JSONToCSS({
			':host': {
				display: 'inline-block',
				opacity: 0.5,
				backgroundColor: '[bg]',
				button: {
					opacity: "[disabled ? 0 : 1]"
				}
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		}, 'comp-test', true)).toBe(':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should allow merging', () => {
		const style = {
			':host': {
				display: 'inline-block',
				opacity: 0.5,
				backgroundColor: '[bg]',
				button: {
					opacity: "[disabled ? 0 : 1]"
				}
			}
		}
		expect(JSONToCSS({
			...style,
			':host': {
				...style[':host'],
				display: 'block',
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		}, 'comp-test', false)).toBe('comp-test {display: block;opacity: 0.5;background-color: [bg];} ' +
			'comp-test button {opacity: [disabled ? 0 : 1];} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should handle @ declarations', () => {
		expect(JSONToCSS({
			'@media screen and (max-width: 760px)': {
				button: {
					opacity: "[disabled ? 0 : 1]",
					'&:hover': {
						backgroundColor: '#000',
						'&:active': {
							backgroundColor: '#666',
						}
					},
					'&.loading': {
						padding: '12px'
					},
				}
			}
		}, 'comp-test', true)).toBe('@media screen and (max-width: 760px) {' +
			'button {opacity: [disabled ? 0 : 1];} ' +
			'button:hover {background-color: #000;} ' +
			'button:hover:active {background-color: #666;} ' +
			'button.loading {padding: 12px;} ' +
			'}')
		
		expect(JSONToCSS({
			':host': {
				'@media screen and (max-width: 760px)': {
					button: {
						opacity: "[disabled ? 0 : 1]",
						'&:hover': {
							backgroundColor: '#000',
							'&:active': {
								backgroundColor: '#666',
							}
						},
						'&.loading': {
							padding: '12px'
						},
					}
				}
			}
		}, 'comp-test', true)).toBe(':host {} ' +
			'@media screen and (max-width: 760px) {' +
			'button {opacity: [disabled ? 0 : 1];} ' +
			'button:hover {background-color: #000;} ' +
			'button:hover:active {background-color: #666;} ' +
			'button.loading {padding: 12px;} ' +
			'}')
	});
	
	it('should handle nested declarations with &', () => {
		expect(JSONToCSS({
			button: {
				opacity: "[disabled ? 0 : 1]",
				backgroundColor: '#222',
				'&:hover': {
					backgroundColor: '#000',
					'&:active': {
						backgroundColor: '#666',
					}
				},
				'&.loading': {
					padding: '12px'
				},
				cursor: "[disabled ? 'not-allowed' : 'pointer']",
			}
		}, 'comp-test', true)).toBe("button {opacity: [disabled ? 0 : 1];background-color: #222;cursor: [disabled ? 'not-allowed' : 'pointer'];} " +
			"button:hover {background-color: #000;} " +
			"button:hover:active {background-color: #666;} " +
			"button.loading {padding: 12px;}")
	});
	
	it('should handle nested declarations without & ', () => {
		expect(JSONToCSS({
			':host': {
				display: 'inline-block',
				opacity: 0.5,
				backgroundColor: '[bg]',
				button: {
					opacity: "[disabled ? 0 : 1]",
					'&:hover': {
						backgroundColor: '#000',
						'&:active': {
							backgroundColor: '#666',
						}
					},
					'& + p': {
						padding: '12px'
					},
					'span, b': {
						display: 'inline-block',
						'i, em': {
							display: 'inline'
						},
					}
				}
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		}, 'comp-test', true))
			.toBe(
			':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			':host button:hover {background-color: #000;} ' +
			':host button:hover:active {background-color: #666;} ' +
			':host button + p {padding: 12px;} ' +
			':host button span, :host button b {display: inline-block;} ' +
			':host button span i, :host button span em, :host button b i, :host button b em {display: inline;} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should handle nested selector names', () => {
		expect(JSONToCSS({
			'.box': {
				display: 'inline-block',
				'&__small': {
					width: '50px',
				},
				'&__large': {
					width: '150px',
				}
			}
		}, 'comp-test', true)).toBe('.box {display: inline-block;} .box__small {width: 50px;} .box__large {width: 150px;}')
	});
})
