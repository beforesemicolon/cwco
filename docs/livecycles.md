## LiveCycles
The native web component API has [livecycles](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks)
methods:
- connectedCallback;
- disconnectedCallback;
- attributeChangedCallback;
- adoptedCallback;

`WebComponent` simply renames them and "fixes" couple of things about some of them.

### onMount
This livecycle function is called when the component is inserted in the document soon after
the first render.

```js
class BFSButton extends WebComponent {
  
  onMount() {
    console.log('mounted', this.mounted, this.isConnected)
  }
  
}

BFSButton.register();

document.body.appendChild(new BFSButton()) // will trigger onMount call

```

You can verify if the component is in the DOM by checking the native [isConnected](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected)
or `WebComponend` "**mounted**" properties. We would strongly you to use `mounted` property instead of `isConnected`
as it will better tell you if the component is in the DOM and its template was parsed and set as well.

### onDestroy
This livecycle function is called when the component is removed from the document.

```js
class BFSButton extends WebComponent {
  
  onDestroy() {
    console.log('removed', this.mounted, this.isConnected)
  }
  
}

BFSButton.register();

const btn = new BFSButton();

document.body.appendChild(btn) // will trigger onMount call

btn.remove() // will trigger onDestroy call

```

### onUpdate
This livecycle function is called right after the DOM gets updated by 
[property](https://github.com/beforesemicolon/cwco/blob/master/docs/properties.md), 
observed [attribute](https://github.com/beforesemicolon/cwco/blob/master/docs/attributes.md) or 
[context](https://github.com/beforesemicolon/cwco/blob/master/docs/context.md)
is updated.

Differently than the `attributeChangedCallback`, the `onUpdate` will only get called if the component is in the DOM
and fully parsed with children rendered.

It will always get called with the name of the property that changed, the old and the new value as arguments except for
context updates where new and old value are always the same for lack of context object tracking.

```js
class BFSButton extends WebComponent {
  static observedAttributes = ['label']
  
  onUpdate(prop, oldValue, newValue) {
    console.log('updated', prop, oldValue, newValue)
  }
  
}

BFSButton.register();

const btn = new BFSButton();

btn.label = 'sample'; // will not trigger onUpdate call because the component is not in the DOM yet

document.body.appendChild(btn) // will trigger onMount call

btn.label = 'another'; // will trigger onUpdate call and DOM update
btn.setAttribute('label', 'another'); // will trigger onUpdate call and DOM update

btn.remove() // will trigger onDestroy call

```

### onAdoption
This livecycle function is called when the component element is moved from one document to another, for example,
if the element is removed from a iFrame document to the current window document.

### onError
This livecycle function is called when an error occurs during the component rendering. You can
[learn more about it here](https://github.com/beforesemicolon/cwco/blob/master/docs/errors.md)

#### Next => [Attributes](https://github.com/beforesemicolon/cwco/blob/master/docs/attributes.md)
