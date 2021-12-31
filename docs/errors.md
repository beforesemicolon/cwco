## Errors

With HTML if something is invalid it will simply be ignored most of the time. If you provide invalid attribute value or
fail to provide a required attribute, the browser will simply ignore the element.

`WebComponent` follows the same philosophy. If you provide invalid attribute value or fail to provide a required
attribute, it will simply be ignored. Anything that goes wrong with your component will be logged to the console but
will not prevent the rest of the app from working.

### onError

The `onError` callback is called when an error occurs. It is passed the error object and will simply log the error to
the console.

It is a perfect hook to use to debug your component. It can also be used to track errors globally.

You can simply create a non-rendering component which sole purpose is to handle errors.

```js
const {WebComponent} = window;

class Component extends WebComponent {
  onError(error) {
    // Always call super.onError() to log the error to the console.
    super.onError(error);
    
    // send error to app tracking analytics
    // or any other error handling logic you need for your app.
  }
}
```

With such component, instead of using `WebComponent` to create your components, you can simply use `Component`
so any error that occurs can be handled in a single place.

```js
class HeadingTitle extends Component {
  static observedAttributes = ['text', 'type'];
  
  onMount() {
    // any error you throw or 
    // the component throws will be handled by the global Component
    throw new Error('failed');
  }
  
  get template() {
    return `<${this.type}><slot>{text}</slot></${this.type}>`
  }
}

HeadingTitle.register()
```

This is simply using the power of OOP inheritance to handle errors. Any component meant to be extended **should not be registered**.

This concept is an amazing `WebComponent` feature that allows you to create variations and a component.