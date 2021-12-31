## Properties
Properties are class properties that WebComponent can watch for updates.

It must not be private, static or setters and getters.

```js
class TodoItem extends WebComponent {
  // properties
  title = 'untitled';
  description = '';
  status = 'in-progress';
  
  get template() {
    return `
      <div class="todo-item">
        <h3>{title}</h3>
        <p>{description}</p>
        <p><strong>Status</strong> {status}</p>
      </div>
    `;
  }
}
```

### Property Update 
Property can be update inside the class or directly on the class instance.

```js
const todo = new TodoItem();

todo.title = 'My Todo';

document.body.appendChild(todo);
```

Whenever there is a property value update the component will update on the DOM.
The example below will update the count whenever the increment and decrement buttons are clicked.

```js
class CounterWidget extends WebComponent {
  // properties
  count = 0;
  
  get template() {
    return `
      {count}
      <button type="button" onclick="updateCount(this.count - 1)">decrement</button>
      <button type="button" onclick="updateCount(this.count + 1)">increment</button>
    `;
  }
  
  updateCount(newCount) {
    this.count = newCount; // will trigger DOM update
  }
}

CounterWidget.register();

document.body.appendChild(new CounterWidget())
```

The component can even detect deep object changes.

If we change the count to be an object with the `value` property, the component will update the DOM when we change
that property.

Any property you declare on the class including all the attributes will be deeply watched.

```js
class CounterWidget extends WebComponent {
  // properties
  count = {value: 0};
  
  get template() {
    return `
      {count.value}
      <button type="button" onclick="updateCount(this.count.value - 1)">decrement</button>
      <button type="button" onclick="updateCount(this.count.value + 1)">increment</button>
    `;
  }
  
  updateCount(newCount) {
    this.count.value = newCount;
  }
}

CounterWidget.register();

document.body.appendChild(new CounterWidget())
```

#### forceUpdate
The `forceUpdate` is a NOT recommended way to force the component DOM Nodes to be updated.

It will not cause the [onUpdate](https://github.com/beforesemicolon/cwco/blob/master/docs/livecycles.md#onupdate) livecycle method to be called.

We can *"fix"* the example above with the `forceUpdate` like so:

```js
class CounterWidget extends WebComponent {
  // properties
  count = {value: 0};
  
  get template() {
    return `
      {count.value}
      <button type="button" onclick="updateCount(this.count.value - 1)">decrement</button>
      <button type="button" onclick="updateCount(this.count.value + 1)">increment</button>
    `;
  }
  
  updateCount(newCount) {
    this.count.value = newCount; // will NOT trigger DOM update
    this.forceUpdate() // not recommended method to update DOM
  }
}
```

You should always keep the data and component simple and try your best to always re-assign rather
than making deep updates. If you find yourself using the `forceUpdate` often it is a great sign you
are doing something wrong.

### Private Property
Private properties are private to anything outside the class. They are perfect when you want to set data
that should only be access or changed inside the class.

One thing to know is that they do not trigger DOM update when they are updated.

#### Properties best practices
- keep properties simple ([primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) only)
- if complex ([objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)):
  - try to re-assign rather than making deep updates 
  - split your component into even smaller components to handle the data snippets 

#### Recommended next: [Context](https://github.com/beforesemicolon/cwco/blob/master/docs/context.md)
