## Properties
Properties are simply class properties that WebComponent watch for updates.

It must not be private, static or setters and getters in order to trigger a DOM update.

```js
class TodoItem extends WebComponent {
  // normal class properties
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
Property can be updated inside the class or directly on the class element instance.

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

This is what makes this library a truly reactive library. It does this by using proxy behind the scenes. Also, it is good
to know that not everything you set as a property will be observed.

For example, you can set a canvas context or a DOM to a property and those will only trigger an update if you re-assign
the property. Not if they changed deeply.

So, updates are triggered by:
- Any property re-assignment;
- Deep updates on plain Array, Typed Arrays, Object Literals, Map and Set.

#### forceUpdate
The `forceUpdate` is a NOT recommended way to force the component DOM Nodes to be updated. 

You should NEVER feel the need to use this method as the component does its job to update the DOM when there is 
change at any level of the properties value.

Know that, it will not cause the [onUpdate](https://github.com/beforesemicolon/cwco/blob/master/docs/livecycles.md#onupdate) livecycle method to be called.

### Private Property
Private properties are private to anything outside the class. They are perfect when you want to set data
that should only be accessed or changed from inside the class.

One thing to know is that they do not trigger DOM update when they are updated. 

Use them to avoid DOM updates when internal stuff change. If a property is not used in the template, it SHOULD be private.

#### Next => [Context](https://github.com/beforesemicolon/cwco/blob/master/docs/context.md)
