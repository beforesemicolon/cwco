import {JSONToCSS} from './json-to-css';

describe('JSONToCSS', () => {
	it('should handle key-value pairs', () => {
		expect(JSONToCSS({
			':host': {
				display: 'inline-block',
				opacity: 0.5,
				backgroundColor: '[bg]',
				'& button': {
					opacity: "[disabled ? 0 : 1]"
				}
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		})).toBe(':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should allow merging', () => {
		const style = {
			':host': {
				display: 'inline-block',
				opacity: 0.5,
				backgroundColor: '[bg]',
				'& button': {
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
		})).toBe(':host {display: block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
	
	it('should handle @ declarations', () => {
		expect(JSONToCSS({
			'@media screen and (max-width: 760px)': {
				button: {
					opacity: "[disabled ? 0 : 1]",
					'& :hover': {
						backgroundColor: '#000',
						'& :active': {
							backgroundColor: '#666',
						}
					},
					'&.loading': {
						padding: '12px'
					},
				}
			}
		})).toBe('@media screen and (max-width: 760px) {' +
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
						'& :hover': {
							backgroundColor: '#000',
							'& :active': {
								backgroundColor: '#666',
							}
						},
						'&.loading': {
							padding: '12px'
						},
					}
				}
			}
		})).toBe(':host {} ' +
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
		})).toBe("button {opacity: [disabled ? 0 : 1];background-color: #222;cursor: [disabled ? 'not-allowed' : 'pointer'];} " +
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
					'& :hover': {
						backgroundColor: '#000',
						'& :active': {
							backgroundColor: '#666',
						}
					},
					'&.loading': {
						padding: '12px'
					},
				}
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			}
		})).toBe(':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			':host button {opacity: [disabled ? 0 : 1];} ' +
			':host button:hover {background-color: #000;} ' +
			':host button:hover:active {background-color: #666;} ' +
			':host button.loading {padding: 12px;} ' +
			'*, *::before, *::after {box-sizing: border-box;}')
	});
})
