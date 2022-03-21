# CWCO

![CWCO Banner](https://github.com/beforesemicolon/cwco/blob/master/docs/Git-Banner.jpg)

[![npm](https://img.shields.io/npm/v/cwco)](https://www.npmjs.com/package/cwco)
![license](https://img.shields.io/github/license/beforesemicolon/cwco)
![node version](https://img.shields.io/badge/min%20node%20version-14.*-brightgreen)
![Build](https://github.com/beforesemicolon/cwco/actions/workflows/codeql-analysis.yml/badge.svg)
![Build](https://github.com/beforesemicolon/cwco/actions/workflows/node.js.yml/badge.svg)

**Contextfull Web Component Library** created to improve native Web Component APIs user experience with:
- ✅ No Build Required (Plug and Play)!
- ✅ Works with other library and frameworks like React, Angular, Vue, Svelte, etc;
- ✅ Truly Reactive Template
- ✅ Powerful built-in Directives(including ability to create your own)
- ✅ Built-in Context Data Handling
- ✅ Event and Data Binding in HTML and CSS
- ✅ Build view directly in HTML file
- ✅ Simple API
- ✅ Fast rendering
- ✅ Lightweight package

### Documentation ([cwco.io](https://cwco.io/))

- [Getting Started](https://cwco.io/documentation/getting-started)
- [WebComponent](https://cwco.io/documentation/web-component)
- [ContextProviderComponent](https://cwco.io/documentation/context-provider-component)
- [Configurations](https://cwco.io/documentation/configurations)
- [Template](https://cwco.io/documentation/template)
- [Styling](https://cwco.io/documentation/stylesheet)
- [Events](https://cwco.io/documentation/events)
- [Attributes](https://cwco.io/documentation/observed-attributes)
- [Properties](https://cwco.io/documentation/properties)
- [Context](https://cwco.io/documentation/context)
- [Directives](https://cwco.io/documentation/if-directive)
- [Custom Directives](https://cwco.io/documentation/custom-directive)
- [LiveCycles](https://cwco.io/documentation/on-mount)
- [Error Handling](https://cwco.io/documentation/on-error)

### Install

This module can be used directly in the browser as well in Node environment. You can even use it along with other
web libraries and frameworks like `React` and `Angular`.

#### Browser
```html 

<!-- use the latest version -->
<script src="https://unpkg.com/cwco/dist/cwco.min.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/cwco@1.0.0/dist/cwco.min.js"></script>

<!-- link your app script after -->
<script src="app.js"></script>
```

#### NodeJs

```
npm install cwco
```

You can then import the constructors class according to what you are building.

```js
const { WebComponent, ContextProviderComponent, Directive } = require('cwco');
```

### Code Editors & IDEs
CWCO is just HTML and if you want syntax highlighting for VSCode you can use the inline-html

#### VSCode
For syntax highlighting of HTML and CSS in javascript use [inline-html](https://github.com/pushqrdx/vscode-inline-html) 
or [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) plugins.

You can import `html` from `cwco` which is just a help for VSCode which does nothing special
to the HTML string you use it with.

```js
import {html, WebComponent} from "./cwco";

class MyButton extends WebComponent {
  get template() {
    return html`<button><slot></slot></button>`
  }
  
  get stylesheet() {
    return html`<style>button {color: #222}</style>`
  }
}
```

#### Jet Brain IDEs
These IDEs have built-in HTML-in-Javascript syntax highlighting which can be useful when developing CWCO web components.

### Want to Help?

[Learn How](https://github.com/beforesemicolon/cwco/blob/master/CONTRIBUTING.md)




