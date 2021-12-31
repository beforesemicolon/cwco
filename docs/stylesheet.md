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
        
        button {
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
If the mode of the component is set to none, the style is then place inside the `head` tag in the document and any 
reference of `:host` will be replaced with the name of the tag.

The above example style will look like the following the head tag.

```html
<head>
	<style id="submit-button">
		submit-button {
			display: inline-block;
		}

		button {
			background: blue;
			color: #222;
		}
	</style>
</head>
```

### data binding
You can refer to data inside the stylesheet by using the `[]` syntax. You can only do it for the property values.

This is great for when you want to refer to some theme data or simply want to react to data changes for CSS updates.
Yes! It will update on data changes. This means that you may not need to define class to pe set or removed
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
            color: [theme?.colors?.light || '#fff'];
            background-color: [theme?.colors?.secondary || '#000'];
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

#### Recommended next: [Template](https://github.com/beforesemicolon/cwco/blob/master/docs/template.md)
