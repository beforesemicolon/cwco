## Attributes
Any attribute placed on the component tag are HTML attributes but in `WebComponent` the attributes referred to are the
ones you decide to observe for changes.

### Defining attributes
These are called `observedAttributes` and must be declared as an array of string attributes exactly how they
would look like when placed on the HTML tag.

```js
class SubmitButton extends WebComponent {
  static observedAttributes = ['label'];
  
  template = '<button type="submit">{label}</button>';
}
```

In other libraries like React, these are referred to as **props**. Attributes that you get notified when they change.

Attribute names must be:
- kebab-case
- lowercase
- must start with a letter
- may contain numbers

### Accessing attribute
`WebComponent` will automatically map the attributes to properties in the class.

If the attribute is in kebab case they will be changed into camel case.

```js
class StatusIndicator extends WebComponent {
  static observedAttributes = ['current-status'];
  
  get template() {
    return '<div class="curr-status">{currentStatus}</button>'
  }
}
```

Since attributes are mapped to be properties, they also work like [properties](https://github.com/beforesemicolon/cwco/blob/master/docs/properties.md).

They will also update the DOM if changed.

```js
const indicator = new StatusIndicator();

document.body.appendChild(indicator);

indicator.setAttribute('current-status', 'Pending');

```

### Auto parsing
The `WebComponent` will automatically try to parse your attribute string into proper data type.

```html
<flat-list list="[2, 4, 6]"></flat-list>
```

Note that these string must be valid JSON strings.

```js
class FlatList extends WebComponent {
  static observedAttributes = ['list'];
  
  onMount() {
    console.log(this.list); // will be an Array [2, 4, 6]
  }
}
```

### class, data-* and style attributes
There are 3 special attributes of the tag that will not be mapped to properties because they already
contain their respective properties.

These are the `class`, `style` and `data-*` attributes.

```js
class StatusIndicator extends WebComponent {
  static observedAttributes = ['class', 'style', 'data-sample'];
}
```

When you observe these attributes you can later access:
- `class` via `className` or `classList`;
- `style` via `style`;
- `data-x` via `dataset`;

When you use these native properties to update the attributes, they will trigger the `onUpdate` callback
as long as they are observed.

```js
const indicator = new StatusIndicator();

indicator.className = 'indicator';
indicator.classList.add('active');
indicator.style.background = 'red';
indicator.dataset.sample = 'x'
```

### Default value
You can define a observed attribute default value by simply defining a camel case version of it.

```js
class MyButton extends WebComponent {
  static observedAttributes = ['label', 'type'];
  type = 'button'; // default value for type if type attribute is not set
  
  template = '<button type="{}">{label}</button>';
  
}
```

### Attributes vs Properties
Attributes end up working just like properties because they are changed to be properties. On top of that,
they have the advantage of triggering changes when they are set or changed on the HTML tag.

You should prefer attributes whenever you are expecting data to be set directly on the tag. 

`WebComponents` allows you to receive simple to complex data via attributes.

```js
<flat-list list="[2, 4, 6, 90]"></flat-list>

// when inside another component template you can refer to the property
// using the curly braces
<flat-list list="{items}"></flat-list>
```

#### Recommended next: [Events](https://github.com/beforesemicolon/cwco/blob/master/docs/events.md)
