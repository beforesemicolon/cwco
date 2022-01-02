# CWCO

**Contextfull Web Component Library** created to improve native Web Component APIs user experience with:
- ✅ Event and Data Binding in HTML and CSS
- ✅ Simple API
- ✅ Reactive Template
- ✅ Lightweight package
- ✅ Fast rendering
- ✅ Build view directly in HTML file
- ✅ Built-in Context
- ✅ Powerful built-in Directives(including ability to create your own)
- ✅ Client and Server Side Rendering
- ✅ Works with other library and frameworks
- 🚫 No Build Required!
- 🚫 No JSX!
- 🚫 No Virtual DOM!
- 🚫 No Weird HTML or Javascript Syntax!
- 🚫 No Decorators Hell!
- 🚫 No Robust Data Store and Context Setup needed!
- 🚫 No Tedious State Management or DOM Manipulation!

### Learn with Examples

[Watch Live Video Introduction](https://www.youtube.com/watch?v=yv3BeEssw9E)

**Learn More From The [Documentation](https://github.com/beforesemicolon/cwco/tree/master/docs)** or 
visit **[Examples Playground Page](https://beforesemicolon.github.io/cwco/?example=create-component.html&theme=neo&file=app.js)** for
an extensive list of examples of everything this framework can do 
**[including some components and small apps examples](https://beforesemicolon.github.io/cwco/?example=app-calculator.html&theme=neo&file=app.js)**.

### Install

This module can be used directly in the browser as well in Node environment

#### Browser
```html 

<!-- use the latest version -->
<script src="https://unpkg.com/cwco/dist/cwco.min.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/cwco@1.0.0/dist/cwco.min.js"></script>

<!-- link your app script after -->
<script src"app.js"></script>
```

#### NodeJs

```
npm install cwco
```

You can then import the constructors class according to what you are building.

```js
const { WebComponent, ContextProviderComponent, Directive } = require('cwco');
```

#### ⚠️ Warning

Make sure to exclude the `jsdom` module when compiling or building your project to run in the browser.
This module is used so `WebComponent` can work in NodeJs (not a browser environment). In browsers, the DOM
will be available and things will be fine.

For example:

```js
// webpack.config.js

module.exports = {
  //...
  externals: {
    jsdom: 'jsdom',
  },
};
```

```js
// esbuild

require('esbuild').build({
  entryPoints: ['app.js'],
  outfile: 'out.js',
  external: ['jsdom'], // <<< exclude
})
```

    Check your bundler documentation to see how it handles specific modules exclusions.

### Documentation

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
