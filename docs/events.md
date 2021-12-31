## Events
You can use event attributes to attach event listeners in the template. These attributes do not
make to the DOM. They are not rendered on the elements.

### Handler Function
You must call the class function that handles that event as the attribute value. There is no need to use
curly braces here to call the handler method. All `on*` attributes are special attributes that are not rendered
on the DOM.

```js
class MyButton extends WebComponent {
  
  handleClick() {}
  
  get template() {
    return `
      <button type="button" onclick="handleClick()"></button>
    `;
  }
}
```

#### $event
You can use the `$event` notation to pass the event to the handler.

```js
class MyButton extends WebComponent {
  
  handleClick(event) {
    console.log(event)
  }
  
  get template() {
    return `
      <button type="button" onclick="handleClick($event)"></button>
    `;
  }
}
```

#### Additional arguments
The `$event` is not the only thing you can pass to the event handler function. You can pass
anything including reference to class properties by using the `this` keyword or any other data.

```js
class MyButton extends WebComponent {
  
  handleClick(numb, event, type) {
    console.log(numb, event, type)
  }
  
  get template() {
    return `
      <button type="button" onclick="handleClick(12, $event, this.getAttribute('type'))"></button>
    `;
  }
}
```

### Handler statements
Sometimes the even handler function does a very simple thing that may feel like too much to create
a whole function for.

For cases like that you can leverage the curly braces to add the logic as a handler and `WebComponent`
will take care of creating a handler for that event listener for you.

The click event handler function simply dispatches a click event.

```js
class MyButton extends WebComponent {
  
  handleClick() {
    this.dispatchEvent(new Event('click'))
  }
  
  get template() {
    return `
      <button type="button" onclick="handleClick()"></button>
    `;
  }
}
```

You can discard the `handleClick` event entirely by adding its logic directly in the template using curly braces.

```js
class MyButton extends WebComponent {
  get template() {
    return `
      <button type="button" onclick="{this.dispatchEvent(new Event('click'))}"></button>
    `;
  }
}
```

You can still reference the `$event` this way.

```js
class MyButton extends WebComponent {
  get template() {
    return `
      <button type="button" onclick="{console.log($event)}"></button>
    `;
  }
}
```

This feature is great for small code execution and should not be used for complex handling.


#### Recommended next: [Properties](https://github.com/beforesemicolon/cwco/blob/master/docs/properties.md)
