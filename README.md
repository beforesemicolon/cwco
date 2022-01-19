# CWCO

![CWCO Banner](https://github.com/beforesemicolon/cwco/blob/master/docs/Git-Banner.jpg)

[![npm](https://img.shields.io/npm/v/cwco)](https://www.npmjs.com/package/cwco)
![license](https://img.shields.io/github/license/beforesemicolon/cwco)
![node version](https://img.shields.io/badge/min%20node%20version-14.*-brightgreen)
![Build](https://github.com/beforesemicolon/cwco/actions/workflows/codeql-analysis.yml/badge.svg)
![Build](https://github.com/beforesemicolon/cwco/actions/workflows/node.js.yml/badge.svg)

**Contextfull Web Component Library** created to improve native Web Component APIs user experience with:
- ✅ No Build Required!
- ✅ Works with other library and frameworks
- ✅ Reactive Template
- ✅ Powerful built-in Directives(including ability to create your own)
- ✅ Built-in Context Data Handling
- ✅ Event and Data Binding in HTML and CSS
- ✅ Build view directly in HTML file
- ✅ Built-in Context
- ✅ Simple API
- ✅ Fast rendering
- ✅ Lightweight package

## Learn by Examples

**Learn More From The [Documentation](https://github.com/beforesemicolon/cwco/blob/master/docs/getting-started.md)** or 
visit **[Examples Playground Page](https://beforesemicolon.github.io/cwco/?example=create-component.html&theme=neo&file=app.js)** for
an extensive list of examples of everything this library can do.

[Watch Live Video Introduction](https://www.youtube.com/watch?v=yv3BeEssw9E)

## Get Started
Learn about how [create a project or starting to explore CWCO](https://github.com/beforesemicolon/cwco/blob/master/docs/getting-started.md)
as soon as possible.

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

#### VSCode &&  IDEs
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

### Documentation

- [Getting Started](https://github.com/beforesemicolon/cwco/blob/master/docs/getting-started.md)
- [WebComponent](https://github.com/beforesemicolon/cwco/blob/master/docs/WebComponent.md)
- [ContextProviderComponent](https://github.com/beforesemicolon/cwco/blob/master/docs/ContextProviderComponent.md)
- [Configurations](https://github.com/beforesemicolon/cwco/blob/master/docs/configurations.md)
- [Template](https://github.com/beforesemicolon/cwco/blob/master/docs/template.md)
- [Events](https://github.com/beforesemicolon/cwco/blob/master/docs/events.md)
- [Attributes](https://github.com/beforesemicolon/cwco/blob/master/docs/attributes.md)
- [Properties](https://github.com/beforesemicolon/cwco/blob/master/docs/properties.md)
- [Context](https://github.com/beforesemicolon/cwco/blob/master/docs/context.md)
- [Directives](https://github.com/beforesemicolon/cwco/blob/master/docs/directives.md)
- [Custom Directives](https://github.com/beforesemicolon/cwco/blob/master/docs/custom-directives.md)
- [LiveCycles](https://github.com/beforesemicolon/cwco/blob/master/docs/livecycles.md)
- [Styling](https://github.com/beforesemicolon/cwco/blob/master/docs/stylesheet.md)
- [Error Handling](https://github.com/beforesemicolon/cwco/blob/master/docs/errors.md)

### Want to Help?

[Learn How](https://github.com/beforesemicolon/cwco/blob/master/CONTRIBUTING.md)




