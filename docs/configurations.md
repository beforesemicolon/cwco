## Configurations
The `WebComponent` class allows for very minimal configuration. These are mostly around the
shadow root and HTML tag. Everything else must be explicitly set to be taken into consideration.

### tagName
The tag name is defined by any of the following:
- the name of the class;
- the value of the static `tagName` property;
- the name you provided when registering with the `register` call;

#### Class name
When you define the class for your component you must use a combination of at least two words
distinguished by casing (camel or pascal casing).
Your class name is then taken and converted into HTML tags before trying to register it.

The tag name must be a [valid tag name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)
according to rules defined by web standards.

```js
class FlatList extends WebComponent {}
// becomes flat-list

class TodoItem extends WebComponent {}
// becomes todo-item

class BFSButton extends WebComponent {}
// becomes bfs-button
```

If you try to access the `tagName` before you register the component, it will simply return
an empty string unless you specified it inside the class.

```js

class FlatList extends WebComponent {}

console.log(FlatList.tagName) // returns ''

FlatList.register();

console.log(FlatList.tagName) // returns 'flat-list'

```

##### tagName
You may also use the static `tagName` inside your class definition. This option is particularly useful
if you want to keep your class names simple and a custom tag name to match.

```js
class Button extends WebComponent {
  static tagName = 'bfs-button';
}

class Todo extends WebComponent {
  static tagName = 'todo-item';
}
```

Using this option to define the tag name gives you the advantage of `tagName` always being there.

```js

class Button extends WebComponent {
  static tagName = 'bfs-button';
}

console.log(Button.tagName) // returns 'bfs-button'

FlatList.register();

console.log(Button.tagName) // returns 'bfs-button'

```

##### register
The name of your tag can also be defined when you try to register your tag as a value for the `register` call.

```js

class FlatList extends WebComponent {}

FlatList.register('flat-list');

console.log(FlatList.tagName) // returns 'flat-list'

```


### mode
The mode refers to the [shadow root mode](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode).

`WebComponent` uses the same mode options plus an additional one:
- **open** (default): the Element [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) is accessible through Javascript from outside the class.
- **closed**: the Element shadowRoot is inaccessible from outside the class via JavaScript.
- **none**: the element inner HTML is not placed inside a shadow root. No shadow root is attached to the component.

```js
class TodoItem extends WebComponent {
  static mode = 'closed'; //
}
```

You can access the shadow root via `root` and `shadowRoot` property in the instance of the element;

```js
class TodoItem extends WebComponent {
  static mode = 'open';
}

const todo = new TodoItem();

// accessing the shadow root element
todo.root;
todo.shadowRoot;

document.body.appendChild(todo);

```

### delegatesFocus
The [delegateFocus](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus) options control s
how the internal focus propagate to the host tag. It can be very useful to apply focus to the component tag when
some internal element receives focus.

```js
class SearchField extends WebComponent {
  static delegateFocus = true;
  
  get template() {
    return '<input type="search" style="outline: none">'
  }
}
```

So instead of this:

```js
class MyButton extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({mode: 'closed', delegatesFocus: true});
  }
}

customElements.define('my-button', MyButton)
```

You can do this:

```js
class MyButton extends WebComponent {
  static mode = 'closed';
  static delegatesFocus = true;
}

MyButton.register();
```


#### Next => [Properties](https://github.com/beforesemicolon/cwco/blob/master/docs/properties.md)
