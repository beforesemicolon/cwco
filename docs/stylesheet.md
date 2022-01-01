## Stylesheet
The stylesheet getter is a way to define the style for the component.

```js
class SubmitButton extends WebComponent {
  static observedAttributes = ['label'];
  
  get stylesheet() {
    return `
      <style>
        :host {
          display: inline-block;
        }
        
        :host button {
          background: blue;
          color: #222;
        }
      </style>
    `;
  }
  
  get template() {
    return '<button type="submit">{label}</button>'
  }
}
```

You don't need to place the CSS inside the style tag when defining the `stylesheet` property. `WebComponent` will
automatically place it inside the `style` tag for you whether inside the shadow root or the head tag.

### mode none
If the mode of the component is set to `none`, the style is then placed inside the `head` tag in the document and any 
reference of `:host` will be replaced with the name of the tag.

The above example style will look like the following the head tag.

```html
<head>
	<style id="submit-button">
		submit-button {
			display: inline-block;
		}

		submit-button button {
			background: blue;
			color: #222;
		}
	</style>
</head>
```

It is very important to start any style selector with `:host` to avoid any affecting other elements on the page
if you intend to use the `none` mode.

### data binding
You can refer to data inside the stylesheet by using the `[...]` syntax. You can only do it for the property values.

This is great for when you want to refer to some theme data or simply want to react to data changes for CSS updates.
Yes! It will update on data changes. This means that you may not need to define class to be set or removed
on data changes to update the style.

Take the following button component as example. It is referring to the `theme` of the app which can be just coming
from some [context provider component](https://github.com/beforesemicolon/cwco/blob/master/docs/ContextProviderComponent.md), 
and it is falling back to some other color in case those do not exist.

```js
class MyButton extends WebComponent {
  get stylesheet() {
    return `
      <style>
        :host button {
            color: [theme?.colors?.light ?? '#fff'];
            background-color: [theme?.colors?.secondary ?? '#000'];
        }
      </style>
    `
  }
  
  get template() {
    return `<button type="button"><slot>click me</slot></button>`;
  }
}
```

Let's say the theme provider component looks something like this:

```js
class ThemeProvider extends ContextProvider {
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

We can then use the `ThemeProvider` component to provide the theme to the `MyButton` component.

```html
<theme-provider>
	<my-button></my-button>
</theme-provider>
```

### import stylesheet
What the `stylesheet` can also return is a stylesheet link. This is useful when you want to import a stylesheet
from another file.

```js
class MyButton extends WebComponent {
  get stylesheet() {
    return '<link rel="stylesheet" href="./my-button.css">'
  }
  
  get template() {
    return `<button type="button"><slot>click me</slot></button>`;
  }
}
```

Modern Browsers will automatically import the stylesheet only ONCE even if the component is used multiple times on the page.

### extend style
The ability to extend style is super useful when you want to inheret other components to make specific changes.

You can have a top component that is not meant to be user directly on the DOM which must NOT be registered. This component
will contain the basic style, template, data and logic needed for the component.

```js
class Button extends WebComponent {
  static observedAttributes = ['label', 'type', 'disabled'];
  type = "button";
  
  get stylesheet() {
    return `
      <style>
        :host {
          display: inline-block;
        }
        
        :host button {
          background: blue;
          color: #222;
        }
      </style>
    `;
  }
  
  get template() {
    return '<button type="{type}">{label}</button>'
  }
}
```

Then you can simply extend the component and reference its stylesheet inside using the [super](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) keyword.

```js
class PrimaryButton extends Button {
  get stylesheet() {
    return `
      ${super.stylesheet}
      <style>
        :host button {
          background: #222;
          color: #fff;
        }
      </style>
    `;
  }
}

PrimaryButton.register();
```

One thing to note is that you can only extend non-link stylesheets. 
If you try to extend a link stylesheet, you will get an error. This will be improved in the future.


#### Next => [Template](https://github.com/beforesemicolon/cwco/blob/master/docs/template.md)
