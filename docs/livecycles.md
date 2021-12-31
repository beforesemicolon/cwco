## LiveCycles
The native web component API has [livecycles](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks)
methods:
- connectedCallback;
- disconnectedCallback;
- attributeChangedCallback;
- adoptedCallback;

`WebComponent` simply rename them and fix couple of things about some of them.

### onMount
This livecycle function is called when the component is inserted in the document even before
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
or `WebComponend` "**mounted**" properties.

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
[property](https://github.com/beforesemicolon/cwco/blob/master/docs/properties.md) or an 
observed [attribute](https://github.com/beforesemicolon/cwco/blob/master/docs/attributes.md) is updated.

It will also get called soon after the first render if there are some observed attributes placed on the 
component tag.

Differently than the `attributeChangedCallback`, the `onUpdate` will only get called if the component is in the DOM.

It will always get called with the name of the property that changed, the old and the new value as arguments.

```js
class BFSButton extends WebComponent {
  static observedAttributes = ['label']
  
  onUpdate(prop, oldValue, newValue) {
    console.log('updated', prop, oldValue, newValue)
  }
  
}

BFSButton.register();

const btn = new BFSButton();

btn.label = 'sample'; // will not trigger onUpdate call

document.body.appendChild(btn) // will trigger onMount call

btn.label = 'another'; // will trigger onUpdate call and DOM update
btn.setAttribute('label', 'another'); // will trigger onUpdate call and DOM update

btn.remove() // will trigger onDestroy call

```

### onAdoption
This livecycle function is called when the component element is moved from one document to another, for example,
if the element is removed from a iFrame document to the current window document.


#### Recommended next: [Styling](https://github.com/beforesemicolon/cwco/blob/master/docs/stylesheet.md)
