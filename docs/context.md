## Context

One of the most powerful features of `WebComponent` is the built-in support for context which allows you to pass data
deep into child elements and divide your data into sections for your app.

### What for?

- It is great for setting global data for features like `theming` and `internationalization` as well as defining what
  data should be available everywhere in the app like the **user information** for example.
- It is also ideal for when you want to define data for a specific part of the app that the rest of the app does not
  need to know about. You can create components that sole job is to manage a specific data and then reuse it everywhere
  replacing only its children
- It is perfect for sharing data between components as well through their parents to avoid additional attributes data
  management

### initialContext

You can specify your initial context data which is great to for the first render of the app if your template depends on
it.

```js
class TodoApp extends WebComponent {
  static initialContext = {
    lang: 'en-US',
    theme: localStorage.getItem('theme') ?? 'dark',
    todos: [],
    loading: true,
    errorMessage: '',
  }
}

TodoApp.register();
```

### updateContext

The `updateContext` is the only method you need to know about when it comes to managing context data. It does both,
define and update context of the component.

```js
class TodoApp extends WebComponent {
  static initialContext = {
    lang: 'en-US',
    theme: localStorage.getItem('theme') ?? 'dark',
    todos: [],
    loading: true,
    errorMessage: '',
  }
  
  onMount() {
    fetch('/api/todos')
      .then(res => res.json())
      .then(res => {
        this.updateContext({
          todos: res.data,
          loading: false,
        })
      })
      .catch(e => {
        console.error(e);
        this.updateContext({
          loading: false,
          errorMessage: e.message,
        })
      })
  }
  
  get template() {
    return `
      <h2>Todo App</h2>
      <todo-list></todo-list>
    `
  }
}

TodoApp.register();
```

The `updateContext` only update the properties that you provide, but it does not do a deep update. The example above
will keep the `lang` and `theme` when updating the `todos`, `loading` and `errorMessage`.

Whenever you do an update the DOM updates as well as any descendent element. This happens regardless if you update the
context with the same data. It does not do any checks whether the data has changed or not.

### $context

`WebComponent` exposes your defined context through the `$context` property and every component have one.

⚠️ Never write to this property. Any changes you need to make to the context needs to happen through the `updateContext`
method.

```js
class TodoList extends WebComponent {
  onMount() {
    console.log(this.$context);
  }
  
  get template() {
    return `
    <div class="todo-list">
      <todo-item 
        repeat="$context.todos" 
        name="{$item.name}" 
        status="{$item.status}" 
        description="{$item.description}"
      ></todo-item>
    </div>
    `;
  }
}

TodoList.register();
```

The `onUpdate` will be triggered after a context change where you can react to do anything you need.

You can access the context in the template as well.

This is particularly great for global data not specific to the component

```js
class TodoItem extends WebComponent {
  static observedAttributes = ['name', 'status', 'description'];
  
  get template() {
    return `
        <div class="todo-item {$context.theme || 'dark'}">
            <h3>{name}</h3>
            <p>{description}</p>
            <p><strong>Status:</strong> {status || 'open'}</p>
        </div>
    `
  }
}

TodoItem.register();
```

The `TodoItem` has a loose dependency on the theme which is set in the app. This is okay as `TodoItem`
is a very specific component to the place it must be used so the dependency is fine.

### Accessing Context
The `$context` can be used to read context from anywhere including from outside the component. From the template
you don't need to reference `$context`, you can simply grab the property directly and in doing so you need to know that
if there are any class property or attribute with the same name they will override the context property with the same
name.

The example below reads the `searchTerm` directly instead of referencing `$context`. If the form had a `searchTerm`
attribute it would grab the attribute instead and, you might have to reference context directly to make the difference.

```js
class SearchForm extends WebComponent {
  static initialContext = {
    searchTerm: '',
  };
  
  get template() {
    return `
        <form onsubmit="handleSubmit()">
          <input value="{searchTerm}" oninput="onInput($event)"></input>
          <button>search</button>
        </form>
    `
  }

  onInput(event) {
    this.updateContext({
      searchTerm: event.target.value
    })
  }

  handleSubmit() {
    // submit logic
  }
}


SearchForm.register();
```

### Context Provider
You can combine the power of template `slot` and context to create context provider components.

```js
class ThemeProvider extends WebComponent {
  static initialContext = {
    theme: 'dark',
    primaryColor: #222,
    secondaryColor: #ddd,
    ctaColor: #930,
  };
  
  get template() {
    return '<slot></slot>'
  }
}

```

So whenever you need to use this information you can simply wrap the part of the app with this component.

```html
<theme-provider>
  <button type="button" style="background: {primaryColor}; color: #fff">themed button</button>
</theme-provider>
```

### Best Practice

The context is not meant to replace `attributes` and `properties` in any way. It has a very specific use case.

- When building dumb components that are meant to be reused in different apps or different part of the apps always
  prefer to get its data through `attributes` and not context.
- When creating a UI library to reuse and shared, only rely on global data related to the UI system like `theme`
  , `colors`, etc. everything else must be provided via `attributes`.
- Global data belongs to the `context`.
- Use context components to manage context.

#### Recommended next: [ContextProviderComponent](https://github.com/beforesemicolon/cwco/blob/master/docs/ContextProviderComponent.md)
