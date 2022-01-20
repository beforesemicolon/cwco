import {ContextProviderComponent} from "./context-provider-component";
import {WebComponent} from "./web-component";
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";

describe('ContextProviderComponent', () => {
	describe('slot', () => {
		it('should render plain slot content with shadow root', () => {
			class SlotC extends ContextProviderComponent {
				static mode = ShadowRootModeExtended.OPEN;
			}

			SlotC.register();

			document.body.innerHTML = '<slot-c><p>one</p><p>two</p></slot-c>';

			const s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<style>:host { display: block; }</style><p>one</p><p>two</p>');
		});

		it('should render plain slot content WITHOUT shadow root', () => {
			class SlotD extends ContextProviderComponent {}

			SlotD.register();

			document.body.innerHTML = '<slot-d><p>one</p><p>two</p></slot-d>';

			const s = document.body.children[0] as WebComponent;

			expect(s.innerHTML).toBe('<p>one</p><p>two</p>');
		});

		it('should render named slot content with shadow root', () => {
			class SlotE extends ContextProviderComponent {
				static mode = ShadowRootModeExtended.OPEN;

				get template() {
					return '<slot name="content"></slot>'
				}
			}

			SlotE.register();

			document.body.innerHTML = '<slot-e><p>one</p><p>two</p></slot-e>';

			let s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<style>:host { display: block; }</style>');

			document.body.innerHTML = '<slot-e><p slot="content">one</p><p>two</p></slot-e>';

			s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<style>:host { display: block; }</style><p slot="content">one</p>');
		});

		it('should render named slot content WITHOUT shadow root', () => {
			class SlotF extends ContextProviderComponent {
				get template() {
					return '<slot name="content"></slot>'
				}
			}

			SlotF.register();

			document.body.innerHTML = '<slot-f><p>one</p><p>two</p></slot-f>';

			let s = document.body.children[0] as WebComponent;

			expect(s.innerHTML).toBe('');

			document.body.innerHTML = '<slot-f><p slot="content">one</p><p>two</p></slot-f>';

			s = document.body.children[0] as WebComponent;

			expect(s.innerHTML).toBe('<p slot="content">one</p>');
			expect(document.head.querySelector(`.${s.tagName}`.toLowerCase())?.outerHTML).toEqual('<style class="slot-f">slot-f { display: block; }</style>');
		});
	})

	it('should remove component tag object  observed attributes before render', () => {
		class ZComp extends WebComponent {
			static observedAttributes = ['foo', 'bar'];

			get template() {
				return "{foo.value} {bar}"
			}
		}

		class RComp extends ContextProviderComponent {
			bar = {
				value: 'bar'
			};
			value = 12;
		}

		ZComp.register();
		RComp.register();

		document.body.innerHTML = `<r-comp><z-comp foo="{bar}" bar="{value}"></z-comp></r-comp>`;

		const r = document.body.children[0] as WebComponent;
		const t = r.root?.children[0] as WebComponent;

		expect(r.root?.innerHTML).toBe('<z-comp bar="12"></z-comp>');
		expect(t.root?.innerHTML).toBe('bar 12');
	});

	describe('style', () => {
		jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			cb(0);
			return 0;
		})

		beforeEach(() => {
			document.head.innerHTML = '';
			jest.resetAllMocks()
		})

		it('should bind data to style', () => {
			class StyleA extends ContextProviderComponent {
				colors = {
					bg: 'red',
					active: 'green',
					dark: '#222',
				}
				font = {
					family: 'sans-serif'
				};
				theme = {
					font: {
						size: {
							headings: {
								h6: '12px'
							}
						}
					}
				}

				get stylesheet() {
					return `
					<style>
						:host {
							--font-family: [this.font && this.font.family];
							--font-size-h6: [this.theme && this.theme.font.size.headings.h6];
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
						
						:host-context(main article) {
						  font-weight: bold;
						}
						
						:host(.active) {
							background: [colors.active] url('./sample.png') no-repeat;
							color: [colors.dark];
						}
					</style>`
				}
			}

			StyleA.register();
			const s = new StyleA();

			document.body.appendChild(s);

			expect(document.head.innerHTML).toBe('<style class="style-a"> ' +
				'style-a { --font-family: sans-serif; --font-size-h6: 12px; background: red } ' +
				'style-a *, style-a *::before, style-a *::after { box-sizing: border-box; } ' +
				'h1 style-a { font-weight: bold; } ' +
				'main article style-a { font-weight: bold; } ' +
				'style-a.active { background: green url(\'./sample.png\') no-repeat; color: #222; } ' +
				'</style>')
		});

		it('should update tracked style tag and links on data changes', () => {
			class StyleB extends ContextProviderComponent {
				color = 'blue';
				static initialContext = {
					theme: {
						fontFamily: 'sans-serif'
					}
				}

				get stylesheet() {
					return `
					<style>
						:host {
							color: [color];
							font-family: [theme.fontFamily];
						}
					</style>`
				}
			}

			StyleB.register();
			const s = new StyleB();

			document.body.appendChild(s);

			expect(document.head.innerHTML).toBe('<style class="style-b"> ' +
				'style-b { color: blue; font-family: sans-serif; } ' +
				'</style>');

			s.color = 'red';

			expect(document.head.innerHTML).toBe('<style class="style-b"> ' +
				'style-b { color: red; font-family: sans-serif; } ' +
				'</style>');

			s.updateContext({
				theme: {fontFamily: 'Aria'}
			});

			expect(document.head.innerHTML).toBe('<style class="style-b"> ' +
				'style-b { color: red; font-family: Aria; } ' +
				'</style>');
		});

		it('should work with directives on style', () => {
			jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
				cb(0);
				return 0;
			})

			class StyleC extends ContextProviderComponent {
				visible = true;

				get stylesheet() {
					return `
					<style if="visible">
						:host {
							color: red;
						}
					</style>`
				}
			}

			StyleC.register();
			const s = new StyleC();

			document.body.appendChild(s);

			expect(document.head.innerHTML).toBe('<style class="style-c"> style-c { color: red; } </style>')

			s.visible = false;

			expect(document.head.innerHTML).toBe('<!-- if: false -->')

			s.visible = true;

			expect(document.head.innerHTML).toBe('<style class="style-c"> style-c { color: red; } </style>')
		});
	});
});
