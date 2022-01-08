# Getting Started
CWCO is just a fun tool to explore and for this guide, you will learn to setup your playground or project so you
can start to play with it.

Know that CWCO was created with typescript and should be compatible already with any typescript project.

## Experiment in Playgrounds
If you want to start right away, consider these browser ready editors playground:

1. [Examples Playground](https://beforesemicolon.github.io/cwco/?example=app-calculator.html&theme=neo&file=app.js)
2. [Static Site CodePen Playground](https://codepen.io/beforesemicolon/pen/WNZzKvY)
3. [Static Site StackBlitz Playground](https://stackblitz.com/edit/web-platform-ezn1mb?file=script.js)

These will allow you to explore CWCO right away in the browser in an interactive way

## Browser
If you have your project already you can go ahead and include the minified CWCO script link in the head of your page
and start exploring it with your setup.

It's okay to add it to the header. It is a very small package.

```html
<!doctype html>
<html lang="en">
<head>
    ...
  
    <!-- use the latest version -->
    <script src="https://unpkg.com/cwco/dist/cwco.min.js"></script>

</head>
<body>
  ...
</body>
</html>
```

## Node
To play with it in a Node environment, you must first install the package and then import it where you want.

```js
const { WebComponent, ContextProviderComponent, Directive } = require('cwco');
```

If you plan on running it on the server, you must include the window file before you import the CWCO package.
This file sets up some global objects like `window`, `document`, `HTMLElement` and `customElements` that the library
relies on in order to run execute the component in a Node environment.

```js
// add it before importing CWCO classes if you plan to execute execute the node file
import 'cwco/dist/node-window';
import { WebComponent, ContextProviderComponent, Directive } from 'cwco';
```

If you are using a Node environment to code your project but you will compile or build it before you ****run it 
in the browser****, you **DON'T need to import window file**.

```js
// btn.js

require('cwco/dist/node-window'); // <- not needed if this code will run in the browser

const { WebComponent } = require('cwco');

class MyButton extends WebComponent {
  static observedAttributes = ['type', 'label'];
  
  get template() {
    return `<button type="{type}"><slot>{label}</slot></button>`;
  }
}   

MyButton.register();

const btn = new MyButton();
btn.innerHTML = 'label'
document.body.appendChild(btn);

console.log(btn.root.innerHTML);
// run with 'node btn.js' to see result
```

## Create a Project
CWCO does not need to be build or compiled so it fits just fine with any project setup.

You can use CWCO with any project alongside any library or framework. 

### Vite project
`vite` is the easiest tool to use to spin up a project to start. You can check its [getting started guide](https://vitejs.dev/guide/#trying-vite-online)
for more details but it comes down to the following commands:

```
npm init vite@latest
# follow the prompt (Pick vanilla project)

npm run dev # start project in the browser
```

Open the `main.js` file and drop this code to try things.
```js
// main.js
import { WebComponent } from 'cwco';

class MyButton extends WebComponent {
  static observedAttributes = ['type', 'label'];
  
  get template() {
    return `<button type="{type}"><slot>{label}</slot></button>`;
  }
}

MyButton.register();

```

Simply import `cwco` and start using it like normal.

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
	  
    <!-- build your view right in the HTML file -->
    <my-button type="button" onclick="alert('it works!')">click me</my-button>
    
    <script type="module" src="/main.js"></script>
  </body>
</html>

```

Vite is an excellent tool to spin up quick projects, and you can use it to spin up other projects which `cwco` works
fine with.

### React project
You can use `create-react-app` to spin a React app and create web component to use it there also.

```
npx create-react-app my-app
cd my-app
npm start
```

```jsx
// ./wc/MyButton
import { WebComponent } from 'cwco';

export class MyButton extends WebComponent {
  static observedAttributes = ['type', 'label'];
  
  get template() {
    return `<button type="{type}"><slot>{label}</slot></button>`;
  }
}


// index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// import and use like a normal package
import { WebComponent } from 'cwco';
import { MyButton } from './wc/MyButton';

// register all web components before app is added to the DOM
WebComponent.registerAll([
  MyButton
]);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

```

You can then use your components normally like a normal HTML tag.

```jsx
// App.jsx
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div id="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <my-button type="button" label="learn more" onClick={() => alert('it works!')}/>
      </header>
    </div>
  );
}

export default App;

```

### Angular project
Angular projects can also user CWCO built web components after a few configurations.

Create your angular project with the following commands
```
# install angular CLI globally
npm install -g @angular/cli

# create your app
ng new my-app

# navigate inside your app
cd my-app

#install cwco
npm install cwco

#run your app
ng serve --open
```

Now go ahead and create your CWCO components, for example:

```js
// src/app/web-components/my-button.component.ts
import { WebComponent } from 'cwco';

export class MyButton extends WebComponent {
  static override observedAttributes = ['type', 'label'];
  
  override get template() {
    return `<button type="{type}"><slot>{label}</slot></button>`;
  }
}

```

Add it to your application module

```js
// src/app/app.module.ts

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';

// import 'WebComponent' from cwco module and all your components here
import {WebComponent} from 'cwco';
import {MyButton} from './web-components/my-button.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // <- needed to avoid unrecognized tag name errors
})
export class AppModule {

  constructor() {
    // register all CWCO components
    WebComponent.registerAll([
      MyButton
    ])
  }
}

```

After that you can start using your component as normal

```html
<!-- src/app/app.component.html -->
<my-button type="button" onclick="alert('it works!')">click me</my-button>
```



#### Next => [WebComponent](https://github.com/beforesemicolon/cwco/blob/master/docs/WebComponent.md)
