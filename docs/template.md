## Template

The web component template is a way for you to communicate to `WebComponent` what the inner HTML of your component looks
like.

Other libraries simply take your HTML or JSX and recalculate things when data are changed.

The `WebComponent` template works differently than other libraries. It will only be read it once when creating the DOM
elements and any detected changes is then made directly on the DOM. The template is simply a static data.

### Define Template

All you need to define your component template is set a getter for template where you return the HTML string
representing the inner part of your component

```js
class TodoItem extends WebComponent {
  get template() {
    return `
      <div class="todo-item">
        <h3>My Todo</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem debitis vitae voluptatibus?</p>
        <p><strong>Status</strong> In Progress</p>
      </div>
    `;
  }
}
```

It is important for the template to be read only so it is not changed before render. You should not reply on dynamically
template update as the future API around this may change.

#### Template ID
You may also use HTML [template tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) to set 
the template of your component and all you have to do is tell the component about the template id.

```html
<template id="todo-item-template">
	<div class="todo-item">
		<h3>My Todo</h3>
		<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem debitis vitae voluptatibus?</p>
		<p><strong>Status</strong> In Progress</p>
	</div>
</template>
```

```js
class TodoItem extends WebComponent {
  templateId = "todo-item-template";
}
```

### Data Binding

You can use curly braces to bind data to your template. Inside the curly braces you can refer to properties from which
you want the value from or add logic that produces strings to be added to your HTML.

```js
class TodoItem extends WebComponent {
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

`WebComponent` track these data references and know when and where to update the DOM when there is a data change. You
don't have to do anything to update the DOM once there is a data change.

#### Data Logic

Inside the curly brace you can put javascript logic that gets executed and result is added to the template.

```js
class TodoItem extends WebComponent {
  title = 'untitled';
  description = '';
  status = 'in-progress';
  
  get template() {
    return `
      <div class="todo-item {status === 'done' ? 'completed' : 'pending'}">
        <h3>{title}</h3>
        <p>{description}</p>
        <p><strong>Status</strong> {status === 'done' ? 'Done' : 'In Progress'}</p>
      </div>
    `;
  }
}
```

### the "this" keyword

There will situations that you must use the `this` keyword in order to put data in the template.

Any explicit public properties declared or observed attributes defined can be referenced in the template without the
need to use the `this` keyword.

```js
class SampleComp extends WebComponent {
  static observedAttributes = ['sample', 'style', 'class', 'data-x'];
  numb = 12;
  #priv = 'yes'
  
  get template() {
    return '{this.#priv}<strong class="{this.className}" style="{this.style.cssText}" data-x="{this.dataset.x}">{numb} {sample}</strong>'
  }
}
```

If the property is something that exists in the HTMLElement or any of its ancestors, you must explicitly reach them
using the `this` keyword.

The same is true for any private property

### Javascript Template Literal

There is a huge difference between
the [Javascript template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
curly braces and `WebComponent` template data binding curly braces.

You can use template literal to generate the template string for `WebComponent` but its notation is not used in
calculating the DOM for the element. Also, remember that the template is only calculated once so if you add logic to
update template on data change in the `${...}` notation, it will not be executed.

Inside the template string, `${...}` is different than `{...}`.

```js
// taking in consideration the TodoItem class...

// this
`<div class="todo-item ${status === 'done' ? 'completed' : 'pending'}">
    <h3>${title}</h3>
    <p>${description}</p>
    <p><strong>Status</strong> ${status === 'done' ? 'Done' : 'In Progress'}</p>
</div>`

// becomes
  `<div class="todo-item pending">
    <h3>untitled</h3>
    <p></p>
    <p><strong>Status</strong> In Progress</p>
</div>`

// which tells WebComponent nothing about where to update on data change
```

It is important for the template to contain the curly braces to mark the placeholders to put the data into.

### slots

Using [HTML slot tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) will make templates more flexible
and dynamic. It is the final detail when it comes to template.

With `WebComponent` slots are even more powerful and allows for something no other framework can do.

You can create your app root tag where the template is a single `slot` tag which means anything you put inside the app
will just get picked up and rendered allowing you to do data and event binding, use directives and more.

```js
const {WebComponent} = window;

class SampleApp extends WebComponent {
  static initialContext = {
    site: {
      title: 'BFS Web Component App',
      description: 'The only framework you need to build your Web Application'
    }
  };
  
  get template() {
    return `<slot></slot>`;
  }
}
```

With this powerful app tag you can compose your entire application right in your HTML file unlike other frameworks that
require you to put the entire app inside the app component body.

```html

<test-app>
	<h1>{site.title}</h1>
	<p>{site.description}</p>
	<section repeat="['Welcome', 'About Us', 'Contact']">
		<h2>{$item}</h2>
		<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid at distinctio
		   eos illo laudantium obcaecati odio quos rerum voluptate voluptatem. Quis!</p>
	</section>
	<footer>
		<p>Copyright &copy; BDS Web Component</p>
	</footer>
</test-app>
```

This means that you can sever side render your application as much as possible and ship only the components that will
handle the non-static part of your website.

#### slotted components registration

Whenever you have a component with a slot anywhere in the template, they must be registered before any other components
for the body handling to work well.

This detail is important because browsers will render the slots before the containing component which will cause it
to not grab the initial data or context of the component or be rendered later which may cause it to be
partially or entirely broken.

```js
class SampleApp extends WebComponent {
...
}

class RowContainer extends WebComponent {
  get template() {
    return `
      <div style="display: flex;">
        <slot></slot>
      </div>`;
  }
}

class SecondaryTitle extends WebComponent {
  static observedAttributes = ['title'];
  
  get template() {
    return `<h2>{title}</h2>`
  }
}

WebComponent.registerAll([
  // slotted components must be registered first 
  // by the order of likelyhood of containing someting else
  SampleApp,
  RowContainer,
  // others can be registered after but still 
  // follow the order from atoms to molecules components
  SecondaryTitle
])
```

#### Recommended next: [Events](https://github.com/beforesemicolon/cwco/blob/master/docs/events.md)
