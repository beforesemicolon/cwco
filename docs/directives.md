## Directives
Directives are HTML attributes not specific to any tag. 

The idea of a directive is already built-in into HTML. For example, the attributes [draggable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable) 
and [contenteditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable) are directives.
They can be placed in any HTML tag to allow that tag to gain special capabilities.

The idea is same here and with Web Components you have a few special built-in ones, and you can also [create a custom
one](https://github.com/beforesemicolon/cwco/blob/master/doc/custom-directives.md) for your need.

One thing in common for all directives is that you don't need to use the curly braces to specify data or logic.
Their value are already understood to be information to be executed for a result. When creating a custom one,
you have a change to handle parsing the value yourself, so you can take values in whatever format you want.

### if
The `if` directive will simply add or remove a node element from the DOM.

One important thing to know about the `if` directive is that the element is always the same instance and 
it simply puts or remove it from the DOM based of something being TRUTHY or FALSY.

```js
class InputField extends WebComponent {
  static observedAttributes = ['label', 'value', 'name', 'type', 'error-message'];
  
  get template() {
    return `
      <label class="input-field">
        <span class="field-label" if="label">{label}</span>
        <input type="{type}" name="{name}" value="{value}"/>
        <span class="error-message" if="errorMessage">{errorMessage}</span>
      </label>
    `
  }
}

InputField.register();
```

Above example is an input field that will only add the label and error span elements to the DOM once their values are
not FALSY.

### repeat
The `repeat` directive will repeat the DOM element based on a list-like object length or a specific number.

#### repeat based on number
You can specify how many times you want the element to be repeated by simply providing a number.

Below example will repeat the `.list-item` div 10 times.

```js
class FlatList extends WebComponent {
  get template() {
    return `
      <div class="list-item" repeat="10">item</div>
    `
  }
}
```

⚠️ The `repeat` directive is not meant to be used with `ref` directive. It will work with any other directives just fine.

#### repeat based of data
You can also provide iterable objects and object literal as value, and it will repeat the element based on number of
entries in the object. 

It supports the following objects:
- Set
- Map
- Array
- String
- Iterable Object created with Symbol.iterator
- Object Literal

The below example will repeat the `.list-item` div based on the items yield by the iterator.

```js
class FlatList extends WebComponent {
  items = {
    *[Symbol.iterator]() {
      yield 10;
      yield 20;
      yield 30;
    }
  };
  
  get template() {
    return `
      <div class="list-item" repeat="items">item</div>
    `
  }
}
```

The following will also work just fine.

```js
class FlatList extends WebComponent {
  items = {
    'first': 200,
    'second': 800,
    'third': 400,
  };
  
  get template() {
    return `
      <div class="list-item" repeat="items">item</div>
    `
  }
}
```

#### $item
It would make no sense to simply repeat elements without a way to reference the items in the list. For that reason,
`WebComponent` exposes a `$item` scoped property at the DOM element level which will contain the value of the item
for that element.

It is available whether you use a number or list-like objects.
```js
class FlatList extends WebComponent {
  get template() {
    return `
      <div class="list-item" repeat="10">{$item}</div>
    `
  }
}
```

The `$item` will be available to be used on the element attributes and any child node.

```js
class FlatList extends WebComponent {
  items = [2, 4, 6];
  
  get template() {
    return `
      <div class="list-item" repeat="items">{$item}</div>
    `
  }
}
```

#### $key
Similarly, you can read the key for the item you are iterating. When using number, Array and Set as value, the `$key` will
be an index, number starting from 0. For Map and Object literal, the key will be the key of the item.

```js
class FlatList extends WebComponent {
  get template() {
    return `
      <div class="list-item item-{$key}" repeat="10">{$item}</div>
    `
  }
}
```

```js
class FlatList extends WebComponent {
  items = {
    'first': 200,
    'second': 800,
    'third': 400,
  };
  
  get template() {
    return `
      <div class="list-item {$key}" repeat="items">{key} item: {$item}</div>
    `
  }
}
```

#### Repeat As
You don't have to stick to `$item` and `$key`. You may also specify how you want to reference the items and keys of
your list which can be convenient when you have nested repeats.

```js
class ContextMenu extends WebComponent {
  static observedAttributes = ['items'];
  
  get template() {
    return `
      <ul repeat="items as $menuItem">
        <li>
          <span>{$menuItem.label}</span>
          <ul repeat="$menuItem.items as $subMenuItem; $key as $id">
            <li>
              <span><b>{$id}</b> {$subMenuItem.label}</span>
            </li>
          </ul>
        </li>
      </ul>
    `
  }
}
```

You don't have to specify a name starting with dollar sign ,but it is conventional to do so in order to distinguish
data created in the template vs from the class or context.


### ref
The `ref` directive allows you to grab a reference to a DOM element. Its value must be the name of the property you want
to assign the reference to.

You can access all the dom element references by using the `$refs` property in the class;

```js
class InputField extends WebComponent {
  static observedAttributes = ['label', 'value', 'name', 'type', 'error-message'];
  
  onMount() {
    // the $refs object will contain all the DOM references
    this.$refs.input.focus();
  }
  
  get template() {
    return `
      <label class="input-field">
        <input ref="input" type="{type}" name="{name}" value="{value}"/>
      </label>
    `
  }
}

InputField.register();
```

⚠️ You can only use the `ref` directive once per element ,and it does not work well with `repeat` and `if` directives.


### attr
The `attr` directive allows you to set an attribute on the DOM element based on TRUTHY or FALSEY value.

It uses the dot notation to separate the attribute name and the value and its value can have two parts
depending on the attribute you are setting;

There are 4 special attributes with special handling: class, style, data and boolean. Everything else will follow the following format:

    attr.[attribute-name]="[attribute value], [condition]"

    Note: The [attribute value] may contain data binding curly braces for data binding but for the [condition] the curly
    braces are not necessary.

#### Boolean Attributes
There are certain attributes in HTML that are considered [boolean attributes](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes). 
They do not require a value, but if you set them to true, they will be set to the attribute name.

The below example will only set the `disabled` attribute on the button if the `disabled` property is truthy.

```js
class ActionButton extends WebComponent {
  static observedAttributes = ['disabled', 'type'];
  
  get template() {
    return `
      <button type="{type}" attr.disabled="disabled"></button>
    `
  }
}

ActionButton.register();
```

#### Style Attribute
There are two ways you can use the `attr` directive to set style attributes. You can use it for a specific style
property...

```js
class ActionButton extends WebComponent {
  static observedAttributes = ['sub-type', 'type'];
  
  get template() {
    return `
      <button type="{type}" attr.style.font-weigth="bold, subType === 'primary'"></button>
    `
  }
}

ActionButton.register();
```
with the format of:

    attr.style.[property-name]="[value], [condition]"

...or you can use it to set a style CSS string;

```js
class ActionButton extends WebComponent {
  static observedAttributes = ['sub-type', 'type'];
  
  get template() {
    return `
      <button type="{type}" attr.style="background: orange; color: black;, subType === 'cta'"></button>
    `
  }
}

ActionButton.register();
```
with the format of:

    attr.style="[CSS string], [condition]"

#### Class Attribute
The `attr` directive can also be used to set class attributes, and it follows the same concept as the style attribute.

You can use it for a specific class...

```js
class ActionButton extends WebComponent {
  static observedAttributes = ['sub-type', 'type'];
  
  get template() {
    return `
      <button type="{type}" attr.class.primary="subType === 'primary'"></button>
    `
  }
}

ActionButton.register();
```
with the format of:

    attr.class.[class-name]="[condition]"

...or you can use it to set a style CSS string;

```js
class ActionButton extends WebComponent {
  static observedAttributes = ['sub-type', 'type'];
  
  get template() {
    return `
      <button type="{type}" attr.class="primary-{subType}, subType === 'cta'"></button>
    `
  }
}

ActionButton.register();
```
with the format of:

    attr.class="[class names], [condition]"

#### Data Attribute
The data attribute is another special attribute that only follows a single format:

You can only use it for a specific data name

```js
class ActionButton extends WebComponent {
  static observedAttributes = ['sub-type', 'type'];
  
  get template() {
    return `
      <button type="{type}" attr.data.special-button="{subType}, subType !== 'default'"></button>
    `
  }
}

ActionButton.register();
```
with the format of:

    attr.data.[data-name]="[value], [condition]"


#### Recommended next: [Custom Directives](https://github.com/beforesemicolon/cwco/blob/master/doc/custom-directives.md)
