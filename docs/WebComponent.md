## WebComponent
The WebComponent class is the only API you need to interact with in order to create your components. 
That should make things pretty simple to learn.

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

MyButton.register();
```

You may also register multiple components at once using the `registerAll` method.

```js
class MyButton extends WebComponent {}
class FlatList extends WebComponent {}
class SiteMenu extends WebComponent {}

WebComponent.registerAll([MyButton, FlatList, SiteMenu])
```

⚠️ When using `registerAll`, know that the order you specify the components really matter.
If a component depends on another, make sure that its dependencies get registered first (comes before in the list).

The best strategy is to register the component soon after definition to avoid dependency issues.

```js
class MyButton extends WebComponent {}
MyButton.register()

class FlatList extends WebComponent {}
FlatList.register()

class SiteMenu extends WebComponent {}
SiteMenu.register()
```

### Component Naming
By default, the WebComponent uses the class name to change into a html tag.

Using our `MyButton` example, it will use that name to create the `my-button` tag and register it like that.

You may also specify your own name using the `register` call or the static `tagName` property inside the class;

```js
class MyButton extends WebComponent {
  // do this
  static tagName: 'special-button'
}

// or this
MyButton.register('special-button');
```

    Note that the register call will override the "tagName" property.

***[Learn More](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)***

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

***[Learn More about Tag Naming](https://github.com/beforesemicolon/cwco/blob/master/docs/configurations.md#tagname)***

### Initialization
The WebComponent also takes care of attaching shadow root and all the setup needed to prepare
your component for rendering.

It split setup into two parts:
- things needed before elements is in the DOM;
- things needed after components is in the DOM;

One of the things is does **before component is in the DOM** is mapping your observed attributes
to properties, so you can easily access them and update them before inserting them on the document.

```js
class CountDisplay extends WebComponent {
  static observedAttributes = ['count'];
  
  get template() {
    return '{count}'
  }
}

CountDisplay.register();

// to create a 
const countDisplay = new CountDisplay();
// or 
const countDisplay = document.createElement(CountDisplay.tagName);

countDisplay.count = 100;

document.body.appendChild(countDisplay);
/* will render
<count-display>
  #shadow-root (open)
    "100"
</count-display>
 */
```

***[Learn More about Observed Attributes](https://github.com/beforesemicolon/cwco/blob/master/docs/attributes.md)***

When your component is about to render, the template is processed. This is the only time your
template is used and anything update after that happens directly on the DOM.

### Shadow DOM
By default, the WebComponent will render your component content inside a `open` [shadow-root](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).

You can change that by specifying the `mode` static property inside the class.

```js
class MyButton extends WebComponent {
  static mode: 'closed'
}
```

In case you don't want the shadow root, you can just set it to `none`;

```js
class MyButton extends WebComponent {
  static mode: 'none'; // will no attach shadow root
}
```

***Note***: The `none` mode is not natively supported. It is a unique mode specific to the WebComponent class.

***[Learn More about Mode](https://github.com/beforesemicolon/cwco/blob/master/docs/configurations.md#mode)***

the shadow-root element is accessible via the `root` or `shadowRoot` property. It will be null if the mode is other than "open"

```js
class MyButton extends WebComponent {
  onMount() {
    console.log(this.root);
    console.log(this.shadowRoot);
  }
}
```

### parseHTML
The HTML string used by this framework will not be parsed correctly by the browser as it allows many illegal symbols
mixed with HTML in the body or attribute values. Because of this, you should always try to parse HTML string specific
to this framework using the `WebComponent.parseHTML` static method as it takes in consideration all the special syntax.

#### Recommended next: [Configurations](https://github.com/beforesemicolon/cwco/blob/master/docs/configurations.md)
