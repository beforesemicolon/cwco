import {JSONToCSS} from './json-to-css';

describe('JSONToCSS', () => {
	it('should handle key-value pairs', () => {
		expect(JSONToCSS({
			':host': {
				display: 'inline-block',
				opacity: 0.5,
				backgroundColor: '[bg]'
			},
			'*, *::before, *::after': {
				boxSizing: 'border-box',
			},
			button: {
				opacity: "[disabled ? 0 : 1]"
			}
		})).toBe(':host {display: inline-block;opacity: 0.5;background-color: [bg];} ' +
			'*, *::before, *::after {box-sizing: border-box;} ' +
			'button {opacity: [disabled ? 0 : 1];}')
	});
	
	it('should handle @ declarations', () => {
		expect(JSONToCSS({
			'@media screen and (max-width: 760px)': {
				button: {
					opacity: "[disabled ? 0 : 1]"
				}
			}
		})).toBe('@media screen and (max-width: 760px) {button {opacity: [disabled ? 0 : 1];} }')
		
		expect(JSONToCSS({
			':host': {
				'@media screen and (max-width: 760px)': {
					button: {
						opacity: "[disabled ? 0 : 1]"
					}
				}
			}
		})).toBe(':host {} ' +
			'@media screen and (max-width: 760px) {button {opacity: [disabled ? 0 : 1];} }')
	});
	
	it('should handle nested declarations with &', () => {
		expect(JSONToCSS({
			button: {
				opacity: "[disabled ? 0 : 1]",
				backgroundColor: '#222',
				'& :hover': {
					backgroundColor: '#000',
					'& :active': {
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
})
