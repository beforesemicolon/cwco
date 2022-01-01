## Custom Directives
The idea of a directive is already built-in into HTML. For example, the attributes [draggable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable)
and [contenteditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable) are directives.

Directives are simply HTML attributes not specific to any tag which give the tag additional capabilities or change it to
something else based on specified values.

With `cwco` the convention is the same, but you get the additional capability of overriding native HTML attribute
implementation -- something never seen before. That means that you can implement your own `draggable` directive
to behave the way you would like to.

### Directive
To give you the ability to create your own directive, a `Directive` class is exposed which you can extend to define
your custom directive. It is that easy.

```js
// in the browser
const {Directive} = Window;

// in node
const {Directive} = require("cwco")
```

All you have to do is create your class that extends `Directive`.

```js
class Wrapper extends Directive {
  // logic inside
}
```

### Name
⚠️ It is very important to know that the name of your class is used to create the directive, and it will be all
lower-cased when used on the tags.

For our example above, the attribute would be called `wrapper`.

That means that you could create a class called `ContentEditable` and the attribute would be called `contenteditable`.

⚠️ Another good thing to know is that the directive attribute is removed before attaching the element to the DOM but the
framework keeps track of the node and its directive and will make sure to handle things in the background for you.

### Register
Just by creating your directive class will not make it immediately usable. You must register your directive first by 
calling the `register` method very similarly to how you register components.

```js
class Wrapper extends Directive {
  // logic inside
}

Wrapper.register();
```

⚠️ A good best practices is to register all your directives before your components, so they get picked up when rendering
the components you create.

You may also specify a name for your directive when you are registering it.
```js
class Wrapper extends Directive {
  // logic inside
}

Wrapper.register('wrap-in');
```

⚠️ Simply make sure that the directive name is a valid attribute name and without "dots" as these have special meaning
for this library. This library will not validate your directive name.

### Parse Value
The `Directive` class exposes the `parseValue` method you must override to handle parsing the attribute value string
before it gets changed to a specific data.

It must return a valid JSON value string, and it gets called with the value (if any) and props which are the rest of the attribute name 
after the dot(if any).

For example, for the `attr` directive the `parseValue` would be called with `item` as value and `class` as prop.
```html
<button attr.class="item, true">click me</button>
```
For the `repeat` directive the `parseValue` would be called with `3` as value and `null` as prop.
```html
<li repeat="3">{$item}</li>
```

Let's look at a more concrete example with our `wrapper` directive.

The `wrapper` directive takes the name of the tag to wrap the node in. The below example would create 3 `li` tags
based on the `repeat` value inside a `ul` tag and our custom `wrapper` directive would then put the `ul` tag inside
the `nav` tag.
```html
<ul wrapper="nav">
	<li wrapper="ul">{$item}</li>
</ul>
```

For this example the `parseValue` would be called with `nav` as value and `null` as prop.

We could also support props. let's say we can tell which `display` to set on the wrapper tag like so.
```html
<ul wrapper.grid="nav">
	<li wrapper="ul">{$item}</li>
</ul>
```

This time the `parseValue` would be called with `nav` as value and `grid` as prop, and we can handle it like this:
```js
class Wrapper extends Directive {
  parseValue(value, prop) {
    return `["${value}", "${prop}"]`;
  }
}

Wrapper.register();
```
The `parseValue` must return a valid `JSON` value STRING and what we are returning is a string representation of an 
array with 2 items. The first is the value and the second is the prop. This string will be then changed into a real
array and passed to the `render` method as first argument.

### Render
The `render` method is what tells the framework how to render the element. It is also where you will put the logic related
to how you want the element to render. 

⚠️ It must return a valid node(text, comment or any other HTML element), array of nodes or null. Whatever you return
will be rendered instead of the node element but if you return `null` the node will be simply commented out. Returning
the node received simply means the node will remain rendered.

The `render` method gets called with 2 arguments:
- **value** (result of parsing the string returned by `parseValue`);
- options containing 
  - **element**: the element that the directive is attached to;
  - **rawElementOuterHTML**: the element's outerHTML as it was defined in the template. Use `WebComponent.parseHTML` to turn into an Element;
  - **anchorNode**: the last node or array of node the directive render method returned;

Continuing with our `wrapper` example, the `render` method should be expecting an array containing the value and the prop
as first argument, the node itself and its outer HTML as defined in the template.

We can handle that like so.

```js
class Wrapper extends Directive {
  parseValue(value, prop) {
    return `["${value}", "${prop}"]`;
  }
  
  render([value, prop], {element}) {
    const wrapperNode = document.createElement(value);
  
    if(prop) {
      wrapperNode.style.display = prop;
    }
  
    // appendChild will remove the node from the dom
    // which will create problems because the framework
    // will try to find it in the dom to replace it with wrapperNode
    // and not find it
    // NEVER move the node from the DOM
    wrapperNode.appendChild(element.clone(true));
    
    return wrapperNode;
  }
}

Wrapper.register();
```
⚠️ Note that the node was cloned before appended to the `wrapperNode`. It is not a good idea to move the node from its
current place as it will result in weird behaviors. You can set attributes and even insert nodes as descendent
but never remove it from the DOM or remove its children. If you do so, you own the risk. Clone it and modify the clone
as much as you want.

General NO NOs:
- move the node from the DOM which can happen in many different ways;
- setting event listeners. The directive is call on every change and new listeners will be attached every time;
- removing descendent nodes from the DOM. These may contain their own directives and other related complications.
- setting or removing directive attributes. These may or not be picked up by the framework which may lead to weird behaviors.

### node reference
You may also create node references similar to the `ref` directive using the `setRef` method of `Directive`.

This method will set the reference of the node you specify in the component `$refs` object which you can access in
component lifecycle or any other methods.

Let's say we want a directive that creates references of every node first child elements. It would look like this in the HTML:
```html
<ul firstchildref="firstItem">
	<li wrapper="ul">{$item}</li>
</ul>
```
On the javascript side, all we need to do in the render is call `setRef` to create reference of the first child.
```js
class FirstChildRef extends Directive {
  render(name, {element}) {
    if(element.children[0]) {
      this.setRef(name, element.children[0])
    }
    
    return element;
  }
}

FirstChildRef.register();
```

This will be accessed the same way you [access node references inside component](https://github.com/beforesemicolon/cwco/blob/master/doc/directives.md#ref).

### node context
You may also define context data for the node element itself. This is similar to [component context](https://github.com/beforesemicolon/cwco/blob/master/doc/context.md)
which means that you can define data for the node which will be inherited by any descendent nodes.

You already have seen this in action. When you use the `repeat` directive it sets `$item` and `$key` context
which can be accessed by anything inside the node.

```html
<li repeat="3">
    <span>{$item}</span>
</li>
```

Let's say that for some reason(a weird one) we want to display inside a node how many children it has like so:
```html
<todo-app childcount>
    <h2>Todos {$childCount - 1}</h2>
    <todo-item 
        repeat="items" 
        name="{$item.name}" 
        description="{$item.description}" 
        status="{$item.status}"
    ></todo-item>
</todo-app>
```
On the javascript side, all we have to do is the following:
```js
class ChildCount extends Directive {
  render(name, {element}) {
    this.setContext(element, '$childCount', element.children.length)
    
    return element;
  }
}

ChildCount.register();
```

You may also get a specific node context with the `getContext(anyNode)`. 

👌🏽 In general, it is good practice to mark node context data with leading dollar sign like `repeat` context `$item` and `$key`.
It helps makes a good distinction of where data is coming from and match the `cwco` convention as well.

⚠️ It is important to know that a node context data has precedence over the component data or context data. It will also
override its ancestors nodes similarly named context data.

#### Next => [LiveCycles](https://github.com/beforesemicolon/cwco/blob/master/doc/livecycles.md)
