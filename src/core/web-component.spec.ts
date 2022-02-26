import {WebComponent} from './web-component';
import {ShadowRootModeExtended} from "../enums/ShadowRootModeExtended.enum";

describe('WebComponent', () => {

	beforeEach(() => {
		jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
			cb(0)
			return 0;
		});
	});

	afterEach(() => {
		// @ts-ignore
		if (typeof window.requestAnimationFrame.mockRestore === 'function') {
			// @ts-ignore
			window.requestAnimationFrame.mockRestore();
		}
	});

	describe('constructor and configuration', () => {
		class AComp extends WebComponent {
		}

		AComp.register();

		beforeEach(() => {
			AComp.mode = ShadowRootModeExtended.OPEN;
			AComp.observedAttributes = [];
			AComp.delegatesFocus = false;
		})

		it('should define root according to mode', () => {
			AComp.mode = ShadowRootModeExtended.OPEN;
			let a = new AComp();

			expect(a.root).toBeInstanceOf(ShadowRoot);

			AComp.mode = ShadowRootModeExtended.CLOSED;
			a = new AComp();

			expect(a.root).toEqual(null);

			AComp.mode = ShadowRootModeExtended.NONE;
			a = new AComp();

			expect(a.root).toEqual(a);
		});

		it('should map observed attributes to properties', () => {
			AComp.observedAttributes = ['unique', 'is-valid'];

			const a = new AComp();
			document.body.appendChild(a);

			expect((a as any).unique).toBe('');
			expect((a as any).isValid).toBe('');
		});

		it('should set tag name', () => {
			expect(AComp.tagName).toBe('a-comp')
		});
	});

	describe('registration', () => {
		it('should register with new tag name', () => {
			class BComp extends WebComponent {
			}

			expect(BComp.isRegistered).toBeFalsy();

			BComp.register('awesome-comp');

			expect(BComp.tagName).toBe('awesome-comp');
			expect(BComp.isRegistered).toBeTruthy();
		});

		it('should register all given components', () => {
			class CComp extends WebComponent {
			}

			class DComp extends WebComponent {
			}

			expect(CComp.isRegistered).toBeFalsy();
			expect(DComp.isRegistered).toBeFalsy();

			WebComponent.registerAll([CComp, DComp]);

			expect(CComp.isRegistered).toBeTruthy();
			expect(DComp.isRegistered).toBeTruthy();

		});

		it('should throw error if tag name is invalid', () => {
			class EComp extends WebComponent {
			}

			EComp.tagName = 'e';

			expect(() => EComp.register()).toThrowError('Name argument is not a valid custom element name.')
			expect(() => EComp.register('bad')).toThrowError('Name argument is not a valid custom element name.')
		});
	});

	describe('stylesheet', () => {
		it('should be empty if not set', () => {
			class AStyle extends WebComponent {
			}

			AStyle.register();

			const z = new AStyle();

			expect(z.stylesheet).toBe('')
		});

		it('should define style with CSS only', () => {
			class BStyle extends WebComponent {
				get stylesheet() {
					return ':host {display: inline-block;}'
				}
			}

			BStyle.register();

			const f = new BStyle();

			document.body.appendChild(f);

			expect(f.root?.innerHTML).toBe('<style>:host {display: inline-block;}</style>')
		});

		it('should define style with CSS inside style tag', () => {
			class CStyle extends WebComponent {
				get stylesheet() {
					return '<style>:host {display: inline-block;}</style>'
				}
			}

			CStyle.register();

			const g = new CStyle();

			document.body.appendChild(g);

			expect(g.root?.innerHTML).toBe('<style>:host {display: inline-block;}</style>')
		});

		it('should not set style if stylesheet is empty', () => {
			class DStyle extends WebComponent {
				get stylesheet() {
					return '  '
				}
			}

			DStyle.register();

			const h = new DStyle();

			document.body.appendChild(h);

			expect(h.root?.innerHTML).toBe('')
		});

		it('should put style in the head tag if mode is none', () => {
			class EStyle extends WebComponent {
				static mode = ShadowRootModeExtended.NONE;

				get stylesheet() {
					return '<style>:host {display: inline-block;}</style><link rel="stylesheet " href="app.css"> :host {display: inline-block;}'
				}
			}

			EStyle.register();

			const i = new EStyle();

			document.body.appendChild(i);

			expect(i.root?.innerHTML).toBe('')
			expect(document.head.innerHTML).toBe('<link rel="stylesheet " href="app.css"><style class="e-style"> e-style {display: inline-block;}</style><style class="e-style">e-style {display: inline-block;}</style>')
		});

		it('should handle link stylesheet', () => {
			class FStyle extends WebComponent {
				get stylesheet() {
					return '<link rel="stylesheet " href="app.css">'
				}
			}

			FStyle.register();

			const j = new FStyle();

			document.body.appendChild(j);

			expect(j.root?.innerHTML).toBe('<link rel="stylesheet " href="app.css">')
		});

		it('should handle link and style tags', () => {
			class GStyle extends WebComponent {
				get stylesheet() {
					return '<style>:host {display: inline-block;}</style><link rel="stylesheet " href="app.css"> :host {display: inline-block;}'
				}
			}

			GStyle.register();

			const k = new GStyle();

			document.body.appendChild(k);

			expect(k.root?.innerHTML).toBe('<link rel="stylesheet " href="app.css"><style> :host {display: inline-block;}</style><style>:host {display: inline-block;}</style>')
		});

		it('should handle groped' +
			' style with square brackets', () => {
			class HStyle extends WebComponent {
				colorVars = {
					border: '#222'
				}

				get stylesheet() {
					return `
						:host([variant="text"]) .btn {
							background: none;
							border: none;
							color: [this.colorVars.border];
							font-weight: 700;
						}
						
						:host([variant="outline"]) .btn:hover,
						:host([variant="text"]) .btn:hover {
							background: #f4f4f4;
						}
					`
				}
			}

			HStyle.register();

			const k = new HStyle();

			document.body.appendChild(k);

			expect(k.root?.innerHTML).toBe('<style>' +
				':host([variant="text"]) .btn { ' +
					'background: none; border: none; color: #222; font-weight: 700; ' +
				'} :host([variant="outline"]) .btn:hover, :host([variant="text"]) .btn:hover { ' +
					'background: #f4f4f4; ' +
				'}</style>')
		});

		it.todo('should update style when data or context changes')
	});

	describe('template', () => {
		it('should not set content with empty template', () => {
			class ATemp extends WebComponent {
			}

			ATemp.register();

			const a = new ATemp();

			document.body.appendChild(a);

			expect(a.root?.innerHTML).toBe('')
		});

		it('should set template in the shadow root if mode is not none', () => {
			class BTemp extends WebComponent {
				get template() {
					return '<div>test</div>'
				}
			}

			BTemp.register();

			const b = new BTemp();

			document.body.appendChild(b);

			expect(b.root?.innerHTML).toBe('<div>test</div>')
		});

		it('should set template in the element if mode is none', () => {
			class CTemp extends WebComponent {
				static mode = ShadowRootModeExtended.NONE;

				get template() {
					return '<div>test</div>'
				}
			}

			CTemp.register();

			const c = new CTemp();

			document.body.appendChild(c);

			expect(c.innerHTML).toBe('<div>test</div>')
		});

		it('should use template id', () => {
			class DTemp extends WebComponent {
				templateId = "sample";
			}

			DTemp.register();

			document.body.innerHTML = `
				<template id="sample"><div>test</div></template>
			`;

			const d = new DTemp();

			document.body.appendChild(d);

			expect(d.root?.innerHTML).toBe('<div>test</div>')
		});

		it('should render html entities', () => {
			class ETemp extends WebComponent {
				get template() {
					return "&copy;"
				}
			}

			ETemp.register();
			const e = new ETemp();

			document.body.appendChild(e);

			expect(e.root?.innerHTML).toBe('©');
		});

		it('should remove component tag object observed attributes before render', () => {
			class FTemp extends WebComponent {
				static observedAttributes = ['foo'];

				get template() {
					return "{foo.value}"
				}
			}

			class GTemp extends WebComponent {
				bar = {
					value: 'bar'
				};

				get template() {
					return "<f-temp foo='{bar}'></f-temp>"
				}
			}

			FTemp.register();
			GTemp.register();

			const g = new GTemp();

			document.body.appendChild(g);

			const f = g.root?.children[0] as WebComponent;

			expect(g.root?.innerHTML).toBe('<f-temp></f-temp>');
			expect(f.root?.innerHTML).toBe('bar');
		});

		it('should handle array of string template', () => {
			const html = (x: TemplateStringsArray) => x.join('');

			class HTemp extends WebComponent {
				bar = {
					value: 'bar'
				};

				get template() {
					return html`<div>text</div>`
				}

				get stylesheet() {
					return html`<style> {color: #222}</style>`
				}
			}

			HTemp.register();

			const h = new HTemp();

			document.body.appendChild(h);

			expect(h.root?.innerHTML).toBe('<style> {color: #222}</style><div>text</div>');
		});
	});

	describe('liveCycles', () => {
		const mountFn = jest.fn();
		const destroyFn = jest.fn();
		const updateFn = jest.fn();
		const adoptionFn = jest.fn();
		const errorFn = jest.fn();

		class MComp extends WebComponent {
			static observedAttributes = ['sample', 'style', 'class', 'data-x'];
			numb = 12;
			deep = {
				value: 2000
			}

			onMount() {
				mountFn();
			}

			onDestroy() {
				destroyFn();
			}

			onUpdate(...args: string[]) {
				updateFn(...args)
			}

			onAdoption() {
				adoptionFn();
			}

			onError(error: ErrorEvent | Error) {
				errorFn(error);
			}
		}

		MComp.register();

		let k: any;

		beforeAll(() => {
			k = new MComp();
		})

		beforeEach(() => {
			k.remove();
			mountFn.mockClear();
			destroyFn.mockClear();
			updateFn.mockClear();
			adoptionFn.mockClear();
			errorFn.mockClear();
		})

		it('should use property values set before mounted if same attribute is not set', () => {
			k.sample = 'new test value';

			document.body.appendChild(k);

			expect(k.sample).toBe('new test value');
		});

		it('should trigger onMount when added and onDestroy when removed from the DOM', () => {
			document.body.appendChild(k);

			expect(mountFn).toHaveBeenCalledTimes(1);

			k.remove();

			expect(destroyFn).toHaveBeenCalledTimes(1);
		});

		it('should trigger onAdoption when move to a different document', () => {
			const iframe = document.createElement('iframe');

			document.body.appendChild(iframe)

			iframe.contentDocument?.body.appendChild(k);

			expect(adoptionFn).toHaveBeenCalledTimes(1);
		});

		it('should trigger onUpdate when properties and observed attributes update only if mounted', () => {
			k.remove();
			k.numb = 1000;
			// @ts-ignore
			k.sample = 'unique';
			k.setAttribute('sample', 'diff');

			expect(updateFn).toHaveBeenCalledTimes(0);
			expect(errorFn).toHaveBeenCalledTimes(2);

			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.numb = 2000;
			// @ts-ignore
			k.sample = 'plain';
			k.setAttribute('sample', 'bold');

			expect(updateFn).toHaveBeenCalledTimes(3);
		});

		it('should trigger onUpdate when properties DEEP update only if mounted', () => {
			k.remove();
			k.deep.value = 1000

			expect(updateFn).toHaveBeenCalledTimes(0);
			expect(errorFn).toHaveBeenCalledWith(new Error('[Possibly a memory leak]: Cannot set property "deep" on unmounted component.'));
			expect(k.deep).toEqual({"value": 1000});

			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.deep.value = 1500;

			expect(updateFn).toHaveBeenCalledWith("deep", {value: 1500}, {value: 1500});
		});

		it('should trigger onUpdate when class gets updated through classes property or setAttribute', () => {
			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.className = 'sample';
			k.classList.add('cls');
			k.setAttribute('class', 'cls elem');

			expect(updateFn).toHaveBeenCalledTimes(3);
		});

		it('should trigger onUpdate when style gets updated', () => {
			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.setAttribute('style', 'display: none;');

			expect(updateFn).toHaveBeenCalledTimes(1);
		});

		it('should trigger onUpdate when data attributes gets updated', () => {
			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.dataset.x = 'something'

			expect(updateFn).toHaveBeenCalledTimes(1);
		});
		
		it('should call onUpdate once when multiple properties change at once', () => {
			const updateSpy = jest.fn();
			
			class UComp extends WebComponent {
				prop1 = 12;
				prop2 = 300;
				prop3 = 0;
				
				onUpdate(...args: string[]) {
					updateSpy(...args)
				}
				
				do() {
					this.prop1 = 21;
					this.prop2 = 3;
					this.prop3 = 100;
				}
			}
			
			UComp.register();
			
			const u = new UComp();
			
			document.body.appendChild(u);
			
			u.do();
			
			expect(updateSpy).toHaveBeenCalledTimes(3);
		});
	});

	describe('update DOM', () => {
		let n: any;

		class NComp extends WebComponent {
			static observedAttributes = ['sample', 'style', 'class', 'data-x'];
			numb = 12;
			obj = {
				value: 300
			}

			get template() {
				return '{obj.value}<strong class="{this.className}" style="{this.style.cssText}" data-x="{this.dataset.x}">{numb} {sample}</strong>'
			}
		}

		NComp.register();

		beforeEach(() => {
			n?.remove();
			n = new NComp();
			document.body.appendChild(n);

			n.numb = 12;
			// @ts-ignore
			n.sample = '';
			n.obj.value = 300;
			n.className = '';
			n.setAttribute('style', '');
			n.dataset.x = '';
		})

		it('should render', () => {
			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">12 </strong>')
		});

		it('should update DOM when properties update', () => {
			n.numb = 100;

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">100 </strong>')
		});

		it('should update DOM when observed attributes update', () => {
			// @ts-ignore
			n.sample = 'items';

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">12 items</strong>')
		});

		it('should update DOM when class gets updated', () => {
			n.className = 'my-items';
			n.classList.add('unique')

			expect(n.root?.innerHTML).toBe('300<strong class="my-items unique" style="" data-x="">12 </strong>')
		});

		it('should update DOM when style gets updated', (done) => {
			n.style.background = 'red';
			n.style.display = 'block';

			setTimeout(() => {
				expect(n.root?.innerHTML).toBe('300<strong class="" style="background: red; display: block;" data-x="">12 </strong>');
				done()
			})
		});

		it('should update DOM when data attributes gets updated', () => {
			n.dataset.x = 'test-value';

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="test-value">12 </strong>');
		});
		
	})

	describe('data bind', () => {
		it('should render attribute with multiple bindings', () => {
			class BindingA extends WebComponent {
				x = 'X';
				y = 'Y';

				get template() {
					return '<div class="{x} {y}"></div>'
				}
			}

			BindingA.register();
			const s = new BindingA();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('<div class="X Y"></div>')
		});

		it('should render attribute with single binding', () => {
			class BindingB extends WebComponent {
				cls = 'items';

				get template() {
					return '<div class="{cls}"></div>'
				}
			}

			BindingB.register();
			const s = new BindingB();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('<div class="items"></div>')
		});

		it('should render text with multiple bindings', () => {
			class BindingC extends WebComponent {
				x = 'X';
				y = 'Y';

				get template() {
					return '{x} {y}'
				}
			}

			BindingC.register();
			const s = new BindingC();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('X Y')
		});

		it('should render text with single binding', () => {
			class BindingD extends WebComponent {
				val = 'some text';

				get template() {
					return '{val}'
				}
			}

			BindingD.register();
			const s = new BindingD();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('some text')
		});

		it('should take object as attribute value', () => {
			class BindingE extends WebComponent {
				static observedAttributes = ['list']

				get template() {
					return '{list[1]}'
				}
			}

			BindingE.register();
			const s = new BindingE();

			document.body.appendChild(s);

			s.setAttribute('list', '["first", "second"]')

			expect(s.root?.innerHTML).toBe('second')
		});

		it('should handle textarea text binding', () => {
			class BindingF extends WebComponent {
				val = 'some text';

				get template() {
					return '<textarea>{val}</textarea>'
				}
			}

			BindingF.register();
			const s = new BindingF();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('<textarea>some text</textarea>')
			expect((s.root?.children[0] as HTMLTextAreaElement).value).toBe('some text');
			
			s.val = 'new value';
			
			expect(s.root?.innerHTML).toBe('<textarea>new value</textarea>')
			expect((s.root?.children[0] as HTMLTextAreaElement).value).toBe('new value');
		});

		it('should bind data to style', () => {
			class BindingG extends WebComponent {
				colors = {
					bg: 'red',
					active: 'green',
					dark: '#222',
				}
				font = 'sans-serif';

				get stylesheet() {
					return `
					<style>
						
						:host {
							--font-family: [this.font];
							background: [colors.bg]
						}
						
						:host(.active) {
							background: [colors.active] url('./sample.png') no-repeat;
							color: [colors.dark];
						}
					</style>`
				}
			}

			BindingG.register();
			const s = new BindingG();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('<style> ' +
				':host { --font-family: sans-serif; background: red } ' +
				':host(.active) { background: green url(\'./sample.png\') no-repeat; color: #222; } ' +
				'</style>')
		});

		it('should pass different data types via attributes', () => {
			const updateSpy = jest.fn();

			class BindingBox extends WebComponent {
				static observedAttributes = ['data', 'disabled'];

				onUpdate(name: string, oldValue: any, newValue: any) {
					updateSpy(newValue);
				}
			}
			class BindingH extends WebComponent {
				data: any = null;

				get template() {
					return `<binding-box data="{data}" disabled></binding-box>`;
				}
			}

			BindingH.register();
			BindingBox.register();
			const s = new BindingH();

			document.body.appendChild(s);

			// @ts-ignore
			expect(s.root?.children[0].disabled).toEqual(true);

			s.data = 12;

			expect(updateSpy).toHaveBeenCalledWith(12);
			updateSpy.mockClear()

			s.data = '{"x": 12}';

			expect(updateSpy).toHaveBeenCalledWith({x: 12});
			updateSpy.mockClear()

			s.data = {x: 12};

			expect(updateSpy).toHaveBeenCalledWith({x: 12});
			updateSpy.mockClear()

			s.data = new Set([12]);

			expect(updateSpy).toHaveBeenCalledWith(expect.any(Set));
			updateSpy.mockClear()

			s.data = () => 12

			expect(updateSpy).toHaveBeenCalledWith(expect.any(Function));
			updateSpy.mockClear()
		});
	})

	describe('event handling', () => {
		it('should attach event listener and remove the reference attribute', () => {
			const clickHandlerSpy = jest.fn();
			const updateSpy = jest.fn();

			class EventA extends WebComponent {
				focused = false;

				onUpdate(name: string, oldValue: unknown, newValue: unknown) {
					updateSpy(name, oldValue, newValue)
				}

				get template() {
					return '<button ' +
						'onclick="handleClick($event, 12)" ' +
						'onfocus="{this.focused = true}"></button>'
				}

				handleClick = (event: Event, numb: number) => {
					clickHandlerSpy(event, numb);
				}
			}

			EventA.register();
			const s = new EventA();

			document.body.appendChild(s);

			s.root?.querySelector('button')?.click();

			expect(clickHandlerSpy).toHaveBeenCalledWith(expect.any(Event), 12);

			s.root?.querySelector('button')?.focus();

			expect(updateSpy).toHaveBeenCalledWith("focused", false, true);
			
			updateSpy.mockClear();
			
			s.handleClick = () => {};
			
			expect(updateSpy).not.toHaveBeenCalled();

		});
	});

	describe('context', () => {

		it('should update app context and be inherited', () => {
			class TargetComp extends WebComponent {
				get template() {
					return '{$context.title}'
				}
			}
			
			class AppComp extends WebComponent {
				get template() {
					return '<div><target-comp></target-comp></div>'
				}
			}
			
			WebComponent.registerAll([TargetComp, AppComp]);
			const app = new AppComp();
			
			document.body.appendChild(app);
			
			expect(app.root?.innerHTML).toBe('<div><target-comp></target-comp></div>')
			expect(app.$context).toBeDefined()

			app.updateContext({
				title: 'Text App'
			});

			expect(app.$context).toEqual({
				title: 'Text App'
			})

			const target = app.root?.querySelector('target-comp') as WebComponent;

			expect(target.$context.title).toEqual("Text App")
			expect(target?.root?.innerHTML).toBe('Text App');

			// should unsubscribe from context and not get updates
			target.remove();

			app.updateContext({
				title: 'Updated Text App'
			});

			expect(target?.root?.innerHTML).toBe('');

			// should update the DOM to grab new context and data
			app.root?.appendChild(target);

			expect(target?.root?.innerHTML).toBe('Updated Text App');
		});
		
		it('should inherit context from parent node', () => {
			class CtxComp extends WebComponent {
				get template() {
					return '{$item}'
				}
			}
			
			class CtxApp extends WebComponent {
				get template() {
					return '<p repeat="1"><ctx-comp></ctx-comp></p>'
				}
			}
			
			CtxApp.register();
			CtxComp.register();
			
			const app = new CtxApp();
			
			document.body.appendChild(app);
			
			const comp = app.root?.querySelector('ctx-comp') as Element;

			expect(comp.shadowRoot?.innerHTML).toBe('1')
		});

		it('should ', () => {
		
		});
	});

	describe('slot', () => {
		it('should render plain slot content with shadow root', () => {
			class SlotA extends WebComponent {
				get template() {
					return '<slot></slot>'
				}
			}

			SlotA.register();

			document.body.innerHTML = '<slot-a><p>one</p><p>two</p></slot-a>';

			const s = document.body.children[0] as WebComponent;
			const sSlot = s.root?.children[0];

			expect(sSlot?.outerHTML).toBe('<slot></slot>');
			expect(s.children[0].assignedSlot).toBe(sSlot);
			expect(s.children[1].assignedSlot).toBe(sSlot);
		});

		it('should render named slot content with shadow root', () => {
			class SlotB extends WebComponent {
				get template() {
					return '<slot name="content"></slot>'
				}
			}

			SlotB.register();

			document.body.innerHTML = '<slot-b><p slot="content">one</p><p>two</p></slot-b>';

			let s = document.body.children[0] as WebComponent;
			const sSlot = s.root?.children[0];

			expect(sSlot?.outerHTML).toBe('<slot name="content"></slot>');
			expect(s.children[0].assignedSlot).toBe(sSlot);
			expect(s.children[1].assignedSlot).toBe(null);
		});

		it('should render inner default slot content', () => {
			class SlotC extends WebComponent {
				backup = "content";

				get template() {
					return '<slot>{backup}</slot>'
				}
			}

			SlotC.register();

			document.body.innerHTML = '<slot-c></slot-c>';

			let s = document.body.children[0] as WebComponent;
			const sSlot = s.root?.children[0];

			expect(sSlot?.outerHTML).toBe('<slot>content</slot>')
		})
		
		it('should handle nested', (done) => {
			class SlotD extends WebComponent {
				one = 10;
				
				get template() {
					return '<slot></slot>'
				}
			}
			
			SlotD.register()
			
			document.body.innerHTML = '<slot-d>\n{one}\n</slot-d>';
			
			setTimeout(() => {
				const s = document.body.children[0] as WebComponent;
				const sSlot = s.root?.children[0];
				
				expect(sSlot?.outerHTML).toBe('<slot></slot>');
				expect((s.childNodes[0] as Element).assignedSlot).toEqual(sSlot);
				expect(s.childNodes[0].textContent?.trim()).toEqual('10');
				done()
			}, 0)
		});
	})

	describe('directives', () => {
		describe('ref', () => {
			it('should set ref attribute', () => {
				class RefA extends WebComponent {
					get template() {
						return '<div ref="myRef"></div>'
					}
				}

				RefA.register();
				const s = new RefA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div></div>')
				expect(s.$refs.myRef).toBeDefined()
			});

			it('should allow to be used in template', () => {
				class RefB extends WebComponent {
					get template() {
						return '<div ref="myRef">{$refs.myRef.nodeName}</div>{$refs.myRef.childNodes.length}'
					}
				}

				RefB.register();
				const s = new RefB();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div>DIV</div>1')
				expect(s.$refs.myRef).toBeDefined()
			});

			it('should crashed if used before create in the template', (done) => {
				class RefC extends WebComponent {
					get template() {
						return '{$refs.myRef.nodeName}<div ref="myRef"></div>'
					}

					onError(error: ErrorEvent) {
						expect(error.message).toMatch('nodeName');
						done();
					}
				}

				RefC.register();
				const s = new RefC();

				document.body.appendChild(s);
			});

			it('should collect multiple refs', () => {
				class RefD extends WebComponent {
					get template() {
						return '<ul><li ref="item">item 1</li><li ref="item">item 2</li></ul>'
					}
				}

				RefD.register();
				const s = new RefD();

				document.body.appendChild(s);

				expect(s.$refs.item).toEqual(expect.any(Array))
				expect((s.$refs.item as Node[]).length).toBe(2)
			});
		});

		describe('bind', () => {
			it('should bind text or attribute to node', () => {
				class BindA extends WebComponent {
					placeholder = 'Search';
					label = 'Field Label';

					get template() {
						return '<span bind="{label}">label</span><input bind.placeholder="{placeholder}" placeholder="Some Value" />'
					}
				}

				BindA.register();
				const s = new BindA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<span>Field Label</span><input placeholder="Search">');

				s.label = "New label";

				expect(s.root?.innerHTML).toBe('<span>New label</span><input placeholder="Search">');

				s.placeholder = "Search...";

				expect(s.root?.innerHTML).toBe('<span>New label</span><input placeholder="Search...">');
			});
		});

		describe('attr', () => {
			it('should handle class attribute', () => {
				class AttrA extends WebComponent {
					check1 = true;
					check2 = true;
					val = 'attr'

					get template() {
						return '<div attr.class.test="check1" attr.class="sample-{val}, check2">'
					}
				}

				AttrA.register();
				const s = new AttrA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div class="test sample-attr"></div>')

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<div class="sample-attr"></div>')

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<div class="sample-attr test"></div>')
			});

			it('should handle style attribute', () => {
				class AttrB extends WebComponent {
					check1 = true;
					check2 = true;
					errorColor = 'red';
					textColor = 'white';

					get template() {
						return '<div attr.style="color: {textColor}, check1" attr.style.background-color="{errorColor}, check2">'
					}
				}

				AttrB.register();
				const s = new AttrB();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div style="color: white; background-color: red;"></div>');

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<div style="background-color: red;"></div>');

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<div style="background-color: red; color: white;"></div>');
			});

			it('should handle data attribute', () => {
				class AttrC extends WebComponent {
					check1 = true;
					check2 = true;
					status = 'good';

					get template() {
						return '<div attr.data.sample-test="{status}, check1" attr.data.dashed-sample="great, check2">'
					}
				}

				AttrC.register();
				const s = new AttrC();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div data-sample-test="good" data-dashed-sample="great"></div>');

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<div data-dashed-sample="great"></div>');

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<div data-dashed-sample="great" data-sample-test="good"></div>');
			});

			it('should handle boolean attribute', () => {
				class AttrD extends WebComponent {
					static observedAttributes = ['disabled', 'hidden']

					get template() {
						return '<button attr.disabled="disabled" attr.hidden="hidden"></button>'
					}
				}

				AttrD.register();
				document.body.innerHTML = '<attr-d></attr-d>';

				const s = document.body.children[0] as WebComponent;

				expect(s.root?.innerHTML).toBe('<button></button>');

				s.setAttribute('disabled', '');

				expect(s.root?.innerHTML).toBe('<button disabled=""></button>');

				// @ts-ignore
				s.disabled = false;

				expect(s.root?.innerHTML).toBe('<button></button>');

				// @ts-ignore
				s.hidden = true;

				expect(s.root?.innerHTML).toBe('<button hidden=""></button>');
			});

			it('should handle other attributes', () => {
				class AttrE extends WebComponent {
					check1 = true;
					check2 = true;

					get template() {
						return '<button attr.autocomplete="check1" attr.autofocus="check2" attr.name="sample, check2"></button>'
					}
				}

				AttrE.register();
				const s = new AttrE();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<button autocomplete="true" autofocus="" name="sample"></button>');

				s.check2 = false;

				expect(s.root?.innerHTML).toBe('<button autocomplete="true"></button>');

				s.check2 = true;

				expect(s.root?.innerHTML).toBe('<button autocomplete="true" autofocus="" name="sample"></button>');
			});
		});

		describe('if', () => {
			it('should render element and react to changes after', () => {
				class IfA extends WebComponent {
					check = true;

					get template() {
						return '<button if="check">click me</button>'
					}
				}

				IfA.register();
				const s = new IfA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<button>click me</button>');

				s.check = false;

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.check = true;

				expect(s.root?.innerHTML).toBe('<button>click me</button>');
			});

			it('should NOT render element and react to changes after', () => {
				class IfD extends WebComponent {
					check = false;

					get template() {
						return '<button if="check">click me</button>'
					}
				}

				IfD.register();
				const s = new IfD();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.check = true;

				expect(s.root?.innerHTML).toBe('<button>click me</button>');

				s.check = false;

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');
			});

			it('should handle nested ifs', () => {
				class IfB extends WebComponent {
					check = true;
					icon = '';

					get template() {
						return '<button if="check">click me <span if="icon">{icon}</span></button>'
					}
				}

				IfB.register();
				const s = new IfB();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<button>click me <!-- if:  --></button>');

				s.icon = 'star';

				expect(s.root?.innerHTML).toBe('<button>click me <span>star</span></button>');

				s.icon = '';

				expect(s.root?.innerHTML).toBe('<button>click me <!-- if:  --></button>');
			});

			it('should handle nested ifs reversed', () => {
				class IfE extends WebComponent {
					check = false;
					icon = 'star';

					get template() {
						return '<button if="check">click me <span if="icon">{icon}</span></button>'
					}
				}

				IfE.register();
				const s = new IfE();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.check = true;

				expect(s.root?.innerHTML).toBe('<button>click me <span>star</span></button>');

				s.icon = '';

				expect(s.root?.innerHTML).toBe('<button>click me <!-- if:  --></button>');

				s.icon = 'star';

				expect(s.root?.innerHTML).toBe('<button>click me <span>star</span></button>');
			});

			it('should handle sequential ifs', () => {
				class IfC extends WebComponent {
					check = true;

					get template() {
						return '<p if="check">lorem</p><p if="!check">lorem</p><p if="check">lorem</p>'
					}
				}

				IfC.register();
				const s = new IfC();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<p>lorem</p><!-- if: false --><p>lorem</p>');

				s.check = false;

				expect(s.root?.innerHTML).toBe('<!-- if: false --><p>lorem</p><!-- if: false -->');
			});

			it.todo('should handle nested component ifs');
		});

		describe('repeat', () => {
			it('should repeat element based on number', () => {
				class RepeatA extends WebComponent {
					count: any = 3;

					get template() {
						return '<li repeat="count" class="item-{$key}">item {$item}</li>'
					}
				}

				RepeatA.register();
				const s = new RepeatA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1</li><li class="item-1">item 2</li><li class="item-2">item 3</li>');

				s.count = 1;

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1</li>');

				s.count = Array.from({length: 3}, (_, i) => i + 1);

				s.count = 1;

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1</li>');

				s.count = Array.from({length: 3}, (_, i) => i + 1);

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1</li><li class="item-1">item 2</li><li class="item-2">item 3</li>');

				s.count = new Set([2, 4, 6]);

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 2</li><li class="item-1">item 4</li><li class="item-2">item 6</li>');

				s.count = new Map([['one', 1], ['two', 2], ['three', 3]]);

				expect(s.root?.innerHTML).toBe('<li class="item-one">item 1</li><li class="item-two">item 2</li><li class="item-three">item 3</li>');

				s.count = {one: 100, two: 200, three: 300};

				expect(s.root?.innerHTML).toBe('<li class="item-one">item 100</li><li class="item-two">item 200</li><li class="item-three">item 300</li>');

				s.count = 'two';

				expect(s.root?.innerHTML).toBe('<li class="item-0">item t</li><li class="item-1">item w</li><li class="item-2">item o</li>');

				s.count = {
					* [Symbol.iterator]() {
						yield 500;
						yield 250;
						yield 50;
					}
				}

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 500</li><li class="item-1">item 250</li><li class="item-2">item 50</li>');

			});

			it('should handle nested repeats', () => {
				class RepeatB extends WebComponent {
					count: any = 2;
					innerCount: any = 2;

					get template() {
						return '<li repeat="count" class="item-{$key}">item {$item} <span repeat="innerCount">{$item}</span></li>'
					}
				}

				RepeatB.register();
				const s = new RepeatB();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1 <span>1</span><span>2</span></li><li class="item-1">item 2 <span>1</span><span>2</span></li>');

				s.count = 1;

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1 <span>1</span><span>2</span></li>');

				s.innerCount = 3;

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1 <span>1</span><span>2</span><span>3</span></li>');
			});

			it('should handle event listener for each repeated node', () => {
				const cb = jest.fn();

				class RepeatC extends WebComponent {
					count = 2;

					get template() {
						return '<li repeat="count" class="item-{$key}">' +
							'<span onclick="handleClick($event, $item, $key)">item {$item}</span>' +
							'</li>'
					}

					handleClick(...args: any[]) {
						cb(...args);
					}
				}

				RepeatC.register();
				const s = new RepeatC();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li class="item-0"><span>item 1</span></li><li class="item-1"><span>item 2</span></li>');

				(s.root?.children[0].children[0] as HTMLElement).click();
				(s.root?.children[1].children[0] as HTMLElement).click();

				expect(cb).toHaveBeenCalledTimes(2)
				expect(cb).toHaveBeenCalledWith(new MouseEvent('click'), 1, 0)
				expect(cb).toHaveBeenCalledWith(new MouseEvent('click'), 2, 1)

			});

			it('should render list and update items on click', () => {
				class NumberList extends WebComponent {
					list = [1];

					get template() {
						return '<ul>\n' +
							'<li repeat="list">item-{$item}</li>\n' +
							'</ul>\n' +
							'<button type="button" onclick="addItem()">add to list</button>'
					}

					addItem() {
						this.list.push(this.list.length + 1)
					}
				}

				NumberList.register();

				const btn = new NumberList();

				document.body.appendChild(btn);

				const addBtn = btn.root?.querySelector('button') as HTMLButtonElement;

				expect(addBtn.outerHTML).toEqual('<button type="button">add to list</button>')
				expect(btn.root?.innerHTML).toEqual('<ul>\n' +
					'<li>item-1</li>\n' +
					'</ul>\n' +
					'<button type="button">add to list</button>');

				addBtn.click();

				expect(btn.root?.innerHTML).toEqual('<ul>\n' +
					'<li>item-1</li><li>item-2</li>\n' +
					'</ul>\n' +
					'<button type="button">add to list</button>');
			});

			it('should repeat with custom names', () => {
				class RepeatD extends WebComponent {
					items = [
						{"label": "Home", "items": []},
						{
							"label": "Projects", "items": [
								{"label": "Calculator App", "items": []},
								{"label": "Todo App", "items": []}
							]
						}
					];

					get template() {
						return '' +
							'<ul>\n' +
							'<li\n' +
							'repeat="items as $page"\n' +
							'class="page"\n' +
							'>\n' +
							'<span>{$page.label}</span>\n' +
							'<ul if="$page.items.length">\n' +
							'<li\n' +
							'repeat="$page.items"\n' +
							'class="sub-page"\n' +
							'>\n' +
							'<span>{$item.label}</span>\n' +
							'</li>\n' +
							'</ul>\n' +
							'</li>\n' +
							'</ul>';
					}
				}

				RepeatD.register();
				const s = new RepeatD();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe(
					'<ul>\n' +
					'<li class="page">\n' +
					'<span>Home</span>\n' +
					'<!-- if: 0 -->\n' +
					'</li>' +
					'<li class="page">\n' +
					'<span>Projects</span>\n' +
					'<ul>\n' +
					'<li class="sub-page">\n' +
					'<span>Calculator App</span>\n' +
					'</li>' +
					'<li class="sub-page">\n' +
					'<span>Todo App</span>\n' +
					'</li>\n' +
					'</ul>\n' +
					'</li>\n' +
					'</ul>');

				s.items.push({label: "Contact", items: []});

				expect(s.root?.innerHTML).toBe(
					'<ul>\n' +
					'<li class="page">\n' +
					'<span>Home</span>\n' +
					'<!-- if: 0 -->\n' +
					'</li>' +
					'<li class="page">\n' +
					'<span>Projects</span>\n' +
					'<ul>\n' +
					'<li class="sub-page">\n' +
					'<span>Calculator App</span>\n' +
					'</li>' +
					'<li class="sub-page">\n' +
					'<span>Todo App</span>\n' +
					'</li>\n' +
					'</ul>\n' +
					'</li>' +
					'<li class="page">\n' +
					'<span>Contact</span>\n' +
					'<!-- if: 0 -->\n' +
					'</li>\n' +
					'</ul>');
			});

			it('should allow for sequential repeats', () => {
				class RepeatE extends WebComponent {
					items = [2, 4, 6];

					get template() {
						return '<p repeat="items">{$item}</p>' +
							'<p repeat="items">{$item}</p>';
					}
				}

				RepeatE.register();
				const s = new RepeatE();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<p>2</p><p>4</p><p>6</p><p>2</p><p>4</p><p>6</p>')
			});

			it('should handle nested component repeats', () => {
				class SmallR extends WebComponent {
					static observedAttributes = ['value'];

					get template() {
						return '{value}';
					}
				}

				class RepeatF extends WebComponent {
					static observedAttributes = ['obj'];
					obj = {}

					get template() {
						return '<div name="{attr.name}" repeat="(obj.observedAttrs || []) as attr">' +
							'<small-r if="attr.type === 2" value="{attr.value}"></small-r>' +
							'</div>';
					}
				}

				class ContainerP extends WebComponent {
					val = {
						observedAttrs: [
							{name: 'A', type: 2, value: 'a'},
							{name: 'B', type: 1, value: 'b'},
							{name: 'C', type: 2, value: 'c'},
							{name: 'D', type: 2, value: 'd'},
							{name: 'E', type: 1, value: 'e'},
						]
					};

					get template() {
						return '<repeat-f obj="{val}"></repeat-f>';
					}
				}

				SmallR.register();
				RepeatF.register();
				ContainerP.register();

				const p = new ContainerP();

				document.body.appendChild(p);

				const r = p.root?.children[0] as WebComponent

				expect(r.root?.innerHTML).toBe(
					'<div name="A"><small-r value="a"></small-r></div>' +
					'<div name="B"><!-- if: false --></div>' +
					'<div name="C"><small-r value="c"></small-r></div>' +
					'<div name="D"><small-r value="d"></small-r></div>' +
					'<div name="E"><!-- if: false --></div>');

				p.val = {
					observedAttrs: [
						{name: 'C', type: 2, value: 'c'},
						{name: 'E', type: 1, value: 'e'},
					]
				};

				expect(r.root?.innerHTML).toBe(
					'<div name="C"><small-r value="c"></small-r></div>' +
					'<div name="E"><!-- if: false --></div>')
			})
		});

		describe('should allow mix of directives', () => {
			it('if and repeat', () => {
				class MixA extends WebComponent {
					condition = false;
					count = 3;

					get template() {
						return '<li repeat="count" if="condition" class="item-{$key}">item {$item}</li>'
					}
				}

				MixA.register();
				const s = new MixA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1</li><li class="item-1">item 2</li><li class="item-2">item 3</li>');

				s.condition = false;

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.count = 2;

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<li class="item-0">item 1</li><li class="item-1">item 2</li>');
			});

			it('if and ref', () => {
				class MixB extends WebComponent {
					condition = false;

					get template() {
						return '<li if="condition" class="item" ref="item">my item</li>'
					}
				}

				MixB.register();
				const s = new MixB();

				document.body.appendChild(s);

				const initItemRef = s.$refs.item;

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');
				expect(initItemRef).toBeUndefined();

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<li class="item">my item</li>');
				expect(s.$refs.item).toEqual(s.root?.querySelector('.item'));
			});

			it('if and attr', () => {
				class MixC extends WebComponent {
					condition = false;

					get template() {
						return '<li if="condition" attr.class.item="condition" attr.id="unique, true">my item</li>'
					}
				}

				MixC.register();
				const s = new MixC();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!-- if: false -->');

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<li class="item" id="unique">my item</li>');
			});

			it('repeat and ref', () => {
				class MixD extends WebComponent {
					count = 2;

					get template() {
						return '<li repeat="count" ref="sample">{$item}-{$key}</li>'
					}
				}

				MixD.register();
				const s = new MixD();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li>1-0</li><li>2-1</li>');
				expect(s.$refs.sample).toEqual(Array.from(s.root?.children as HTMLCollection));
			});

			it('repeat and attr', () => {
				class MixE extends WebComponent {
					count = 2;

					get template() {
						return '<li repeat="count" attr.data.test="sample, $key">{$item}-{$key}</li>'
					}
				}

				MixE.register();
				const s = new MixE();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li>1-0</li><li data-test="sample">2-1</li>');
			});

			it('attr and ref', () => {
				class MixF extends WebComponent {
					get template() {
						return '<li ref="item" attr.data.test="sample, true">my item</li>'
					}
				}

				MixF.register();
				const s = new MixF();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li data-test="sample">my item</li>');
				expect(s.$refs.item).toBeDefined();
			});

			it('bind and attr', () => {
				class MixG extends WebComponent {
					get template() {
						return '<li bind.className="bind" attr.class="attr, true" attr.id="attr, true" bind.id="bind">my item</li>'
					}
				}

				MixG.register();
				const s = new MixG();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li class="attr" id="bind">my item</li>');
			});
		});
	});

	it('should detect memory leak', () => {
		jest.useFakeTimers()
		const errorSpy = jest.fn();

		class LeakA extends WebComponent {
			sample = 12;

			onMount() {
				setTimeout(() => {
					this.sample = 200;
				}, 0)
			}

			onError(error: ErrorEvent | Error) {
				errorSpy(error);
			}

			get template() {
				return '{sample}'
			}
		}

		LeakA.register();

		const l = new LeakA();

		document.body.appendChild(l);

		expect(l.root?.innerHTML).toBe('12');

		l.remove();

		jest.runOnlyPendingTimers();

		expect(errorSpy).toHaveBeenCalledWith(new Error('[Possibly a memory leak]: Cannot set property "sample" on unmounted component.'));
		expect(l.root?.innerHTML).toBe('12');

		jest.resetAllMocks()
	});

	describe('should deeply propagate changes', () => {
		const updateSpy = jest.fn();

		class ParentComp extends WebComponent {
			val: any = ['simple'];
			static initialContext = {
				simple: 'value'
			}

			onUpdate(name: string, oldValue: unknown, newValue: unknown) {
				updateSpy(this.tagName, newValue);
			}

			get template() {
				return '<child-comp val="{val}"></child-comp>';
			}
		}

		class ChildComp extends WebComponent {
			static observedAttributes = ['val'];

			onUpdate(name: string, oldValue: unknown, newValue: unknown) {
				updateSpy(this.tagName, newValue);
			}

			get template() {
				return '{val}: {$context.simple}';
			}
		}

		ParentComp.register();
		ChildComp.register();

		let top: ParentComp;
		let child: ChildComp;

		beforeEach(() => {
			updateSpy.mockClear();

			top = new ParentComp();

			document.body.appendChild(top);
			child = top.root?.children[0] as ChildComp;
		})

		it('when property is re-assigned with primitive value', () => {
			top.val = 'nice val';

			expect(updateSpy).toHaveBeenCalledTimes(2);
			expect(updateSpy).toHaveBeenCalledWith("CHILD-COMP", "nice val");
			expect(updateSpy).toHaveBeenCalledWith("PARENT-COMP", "nice val");
			expect(child.root?.innerHTML).toBe('nice val: value');
		});

		it('when property is re-assigned with object literal and deep updated', () => {
			top.val = {value: 'nice val'};

			expect(updateSpy).toHaveBeenCalledTimes(2);
			expect(updateSpy.mock.calls[0]).toEqual(["CHILD-COMP", {"value": "nice val"}]);
			expect(updateSpy.mock.calls[1]).toEqual(["PARENT-COMP", {"value": "nice val"}]);
			expect(child.root?.innerHTML).toBe('{"value":"nice val"}: value');

			updateSpy.mockClear()

			top.val.value = 'new';

			expect(updateSpy).toHaveBeenCalledTimes(2);
			expect(updateSpy.mock.calls[0]).toEqual(["CHILD-COMP", {"value": "new"}]);
			expect(updateSpy.mock.calls[1]).toEqual(["PARENT-COMP", {"value": "new"}]);
			expect(child.root?.innerHTML).toBe('{"value":"new"}: value');
		});

		it('when property is re-assigned with Set and deep updated', () => {
			top.val = new Set(['nice val'])

			expect(updateSpy).toHaveBeenCalledTimes(2);
			expect(updateSpy.mock.calls[0][0]).toBe("CHILD-COMP");
			expect(updateSpy.mock.calls[0][1]).toBeInstanceOf(Set);
			expect(updateSpy.mock.calls[0][1].size).toBe(1);
			expect(updateSpy.mock.calls[1][0]).toEqual("PARENT-COMP");
			expect(updateSpy.mock.calls[1][1]).toBeInstanceOf(Set);
			expect(child.root?.innerHTML).toBe('{}: value');

			updateSpy.mockClear()

			top.val.add('new');

			expect(updateSpy).toHaveBeenCalledTimes(2);
			expect(updateSpy.mock.calls[0][0]).toBe("CHILD-COMP");
			expect(updateSpy.mock.calls[0][1]).toBeInstanceOf(Set);
			expect(updateSpy.mock.calls[0][1].size).toBe(2);
			expect(updateSpy.mock.calls[1][0]).toEqual("PARENT-COMP");
			expect(updateSpy.mock.calls[1][1]).toBeInstanceOf(Set);
			expect(child.root?.innerHTML).toBe('{}: value');
		});

		it('when context changes', () => {
			top.updateContext({
				simple: 'new'
			});

			expect(updateSpy).toHaveBeenCalledTimes(2);
			expect(updateSpy).toHaveBeenCalledWith("CHILD-COMP", ["simple"]);
			expect(updateSpy).toHaveBeenCalledWith("PARENT-COMP", {simple: 'new'});
			expect(child.root?.innerHTML).toBe('["simple"]: new');
		});
	});
});
