## WebComponent
The WebComponent class is the main API you need to interact with in order to create your components. 
That alone make things pretty simple to learn.

This component by default extends the [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) 
class which means it does not allow you to extend specific HTML elements.

So instead of initializing your components like this:

```js
class MyButton extends HTMLElement {
  // code goes here
}
```

... you will do this:

```js
class MyButton extends WebComponent {
  // code goes here
}
```

### Registration
The WebComponent class also takes care of registering the component for you by exposing the `register`
method that you can call to let the document know you have a special tag to use.

```js
class MyButton extends WebComponent {
  // code goes here
}

MyButton.register(); // registers a "my-button" tag
```

You may also register multiple components at once using the `registerAll` method.

```js
class MyButton extends WebComponent {}
class FlatList extends WebComponent {}
class SiteMenu extends WebComponent {}

WebComponent.registerAll([
  MyButton, // registers a "my-button" tag
  FlatList, // registers a "flat-list" tag
  SiteMenu, // registers a "site-menu" tag
])
```

### Component Naming
By default, the WebComponent uses the class name to change into a html tag.

Using our `MyButton` example, it will use the class name to create the `my-button` tag and register it like that.

You may also specify your own name using the `register` call or the static `tagName` property inside the class;

```js
class MyButton extends WebComponent {
  // do this
  static tagName: 'special-button'
}

// or this
MyButton.register('special-button');
```

    Note: The register call will override the "tagName" property as it is more specific.

It is also important to make sure that both, class name or tag name, needs to be at least two words to 
be considered a valid tag name. This is actually a native component name convention.

**The following are considered invalid names:**
- Counter or counter
- Widget or widget
- Field or field
- Title or title

**You can compose the name or prefix with something like:**
- BFSCounter or bfs-counter
- VideoWidget or video-widget
- InputField or input-field
- SmallTitle or small-title

***[Learn About WHATWG Valid Component Naming Spec](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)***

### Initialization
The WebComponent also takes care of attaching shadow root and all the setup needed to prepare
your component for rendering.

```js
class CountDisplay extends WebComponent {
  // every observable atrributes will be mapped to a camelCase equivalent property
  static observedAttributes = ['count'];
  
  get template() {
    return '{count}'
  }
}

CountDisplay.register();

// to create a element from the component do this
const countDisplay = new CountDisplay();
// or this
const countDisplay = document.createElement(CountDisplay.tagName);

// you can access public properties and methods of the component
countDisplay.count = 100;

document.body.appendChild(countDisplay);

/* will render
<count-display>
  #shadow-root (open)
    "100"
</count-display>
 */
```

[Learn More about Observed Attributes](https://github.com/beforesemicolon/cwco/blob/master/docs/attributes.md)

When your component is about to render, the template is processed. This is the only time your
template is used and anything update after that happens directly on the DOM.

[Learn More About Templates](https://github.com/beforesemicolon/cwco/blob/master/docs/template.md)

### Shadow DOM
By default, the WebComponent will render your component content inside an `open` [shadow-root](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).

You can change that by specifying the `mode` static property inside the class.

```js
class MyButton extends WebComponent {
  static mode: 'closed'
}
```

In case you don't want the shadow root, you can just set it to `none`;

```js
class MyButton extends WebComponent {
  static mode: 'none'; // will no attach shadow root to component
}
```

***Note***: The `none` mode is not natively supported. It is a unique mode specific to this library.

[Learn More about Mode](https://github.com/beforesemicolon/cwco/blob/master/docs/configurations.md#mode)

The shadow-root element is accessible via the `root` or `shadowRoot` property. It will be null if the mode is `closed`.
It will return the component itself if the mode is `none`.

```js
class MyButton extends WebComponent {
  onMount() {
    console.log(this.root);
    console.log(this.shadowRoot);
  }
}
```

### parseHTML
The HTML string used by this framework will not be parsed correctly by the browser as it allows many "illegal" symbols
mixed with HTML in the body or attribute values. Because of this, you should always try to parse HTML string specific
to this library using the `WebComponent.parseHTML` static method as it takes in consideration all the special syntax.

```js
const html = `<my-button>
  <span>Hello</span>
</my-button>`;

// parseHTML returns a DocumentFragment containing the parsed HTML nodes
// it is not a fucntioning component, just its DOM representation
const myButton = WebComponent.parseHTML(html).children[0];
```

#### Next => [Configurations](https://github.com/beforesemicolon/cwco/blob/master/docs/configurations.md)
