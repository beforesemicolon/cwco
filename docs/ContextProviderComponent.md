## ContextProviderComponent

The ContextProviderComponent class is a
special [WebComponent](https://github.com/beforesemicolon/cwco/blob/master/docs/WebComponent.md) class
in a sense that it allows you to define the template right in your HTML file with it serving as the data provider for
your template.

```js
// in the browser
const {ContextProviderComponent} = window;

// in node
import {ContextProviderComponent} from "cwco";
```

### Mode
By default, the ContextProviderComponent is in the `"none"` mode. Which means that its content can be easily
target by CSS selectors of the document or in javascript DOM queries.

### Template

By default, the template is a single slot tag which means you don't need to define the component template inside the
class.

You can define your data in the class...

```js
// todo-app.js

class TodoApp extends ContextProviderComponent {
  app = {
    title: "Todo App",
    description: "My super cool todo app",
  }
}

TodoApp.register();
```

...then set the content right in the HTML file and reference the data from the class.

```html
<!-- index.html-->

<todo-app>
	<h1>{app.title}</h1>
	<p>{app.description</p>
</todo-app>
```

### The slot tag

What really makes the ContextProviderComponent special is how it handles the `slot` tag. It has a custom slot handler that gives
it its superpowers. This means that no matter the component mode, the slot tag will be handled the same way which is 
not something you can do natively in HTML.

The template is a single slot tag, but you can also define your own template with slots where you wish. The only thing
you need to keep in mind is that the slot is handled differently.

The example below renders the title and description inside and lets the rest of the app to be defined in the HTML file.

```js
// todo-app.js

class TodoApp extends ContextProviderComponent {
  app = {
    title: "Todo App",
    description: "My super cool todo app",
    todos: []
  }
  
  onMount() {
    fetch('http://localhost:3000/api/todo')
      .then(res => res.json())
      .then(res => {
        this.app.todos = res.data;
      })
  }
  
  openTodo() {
    // handle opening todo
  }
  
  get template() {
    return `
      <h1>{app.title}</h1>
      <p>{app.description</p>
      <slot></slot>
    `;
  }
}

TodoApp.register();
```

You can render the `todo-item` tag inside the `todo-app` tag and it will be placed where the slot tag is defined using
the [repeat directive](https://github.com/beforesemicolon/cwco/blob/master/docs/directives.md#repeat) to repeat
for every `app.todos` array item.

```html
<!-- index.html-->

<todo-app>
	<todo-item
            repeat="app.todos"
            name="$item.name"
            description="$item.description"
            status="$item.status"
            onclick="openTodo($item)"
	></todo-item>
</todo-app>
```

### Data and methods
Any data defined inside the class can be accessed inside the template but not inside the custom components
you create.

From the example above, the `app` object cannot be accessed inside the `todo-item` template. However, you can access
the data and methods inside the `todo-item` tag body as this is still considered to be part of the provider template.

```html
<!-- index.html-->

<todo-app>
	<todo-item
		repeat="app.todos"
		name="$item.name"
		description="$item.description"
		status="$item.status"
	>
        <!-- 
         the todo-item tag has a slot for the button that handles
         opening the single todo app
        -->
        <button onclick="openTodo($item)">open</button>
    </todo-item>
</todo-app>
```

What this means is that, any HTML tag that is placed inside the body of the `todo-app` tag can access the
ToDoApp class data and methods. Any HTML tag that belongs to other tags template will not. For those, you 
need to specify data as context.

### Context
ContextProviderComponent is like any other WebComponent and therefore, it may contain 
[context data](https://github.com/beforesemicolon/cwco/blob/master/docs/context.md).

This is the only way you can provide data inside the descendents component templates and it is excellent
for data you want to share deeply for all components.

```js
class ThemeProvider extends ContextProviderComponent {
  static initialContext = {
    theme: {
      colors: {
        primary: 'purple', 
        secondary: '#222', 
        cta: '#900', 
        light: '#f2f2f2', 
        dark: '#111', 
      },
    }
  }
}
```

Simply wrap your global data provider using context around the component tag, and it will be available
deeply inside any component templates.

```html
<theme-provider>
    <todo-app>
        <button 
            type="button" 
            attr.style="color: {theme.colors.light}; background: {theme.colors.primary}, true">click me</button>
    </todo-app>
</theme-provider>
```

### Styling
By default, all context providers tag will be styled as display block. This can easily be overridden by defining
your own stylesheet property.

Styling your context provider component is no different than styling any other WebComponent but because
by default it does not use shadow root, you need to prefix every style with the `:host` to make sure
the style does not affect things outside of its body.

This is due to the special way style tags are handled in `none` mode. You can 
[Lear more about it here](https://github.com/beforesemicolon/cwco/blob/master/docs/stylesheet.md)

```js
class TodoApp extends ContextProviderComponent {
  // ...
  
  get stylesheet() {
    return `
      <style>
        :host h1 {
          color: [theme.colors.primary];
        }
      </style>
    `;
  }
  
  get template() {
    return `
      <h1>{app.title}</h1>
      <p>{app.description</p>
      <slot></slot>
    `;
  }
}
```

One thing to know is that the [::slotted selector](https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted)
will not work because the way the ContextProviderComponent handles the slot tags no matter what the mode
of the component.

#### Next => [LiveCycles](https://github.com/beforesemicolon/cwco/blob/master/docs/livecycles.md)
