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

			expect(s.root?.innerHTML).toBe('<style class="slot-c">:host { display: block; }</style><p>one</p><p>two</p>');
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

			expect(s.root?.innerHTML).toBe('<style class="slot-e">:host { display: block; }</style>');

			document.body.innerHTML = '<slot-e><p slot="content">one</p><p>two</p></slot-e>';

			s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<style class="slot-e">:host { display: block; }</style><p slot="content">one</p>');
		});

		it('should render named slot content WITHOUT shadow root', () => {
			class SlotF extends ContextProviderComponent {
				static mode = ShadowRootModeExtended.NONE;

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

			expect(s.innerHTML).toBe('<style class="slot-f">slot-f { display: block; }</style><p slot="content">one</p>');
		});
	})

	it('should remove component tag object  observed attributes before render', () => {
		class ZComp extends WebComponent {
			static observedAttributes = ['foo'];

			get template() {
				return "{foo.value}"
			}
		}

		class RComp extends ContextProviderComponent {
			bar = {
				value: 'bar'
			};
		}

		ZComp.register();
		RComp.register();

		document.body.innerHTML = "<r-comp><z-comp foo='{bar}'></z-comp></r-comp>";

		const r = document.body.children[0] as WebComponent;
		const t = r.root?.children[0] as WebComponent;

		expect(r.root?.innerHTML).toBe('<z-comp></z-comp>');
		expect(t.root?.innerHTML).toBe('bar');
	});
});
