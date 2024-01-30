# component-classnames

`component-classnames` is a small library meant to aid in creating reusable React components with flexible stylings.

`component-classnames` attempts to make it easy to:

- Apply default styles to reusable components
- Choose from a selection of default styles easily by passing custom keywords via props
- Extend or overwrite default styles via props (by applying additional class names or inline styles)
- Completely restyle a component via props
- dynamically apply class names to elements inside 'block box' components from outside the component
- Modify the styles of nested components

By making the above easy, `component-classnames` hopes to enable the prospect of applying styles to reusable components in a 'bottom-up' manner, allowing you to write the styles that make the most sense now, and let the consumer of the component to easily make changes to them down the road if needed.

## Installation

```
npm install @takinabradley/component-classnames
```

## Applying default styles:

The `component-classnames` module currently only has one function, named `use`.
Applying default styles is very easy, especially with CSS modules:

```css
/* ComponentName.module.css */
.ComponentName {
  display: flex;
  padding: 1em;
  background-color: gainsboro;
}

.ComponentName__childElement {
  color: rebeccapurple;
}
```

```jsx
import cssModule from "./ComponentName.module.css";
import ccn from "component-classnames";

function Component() {
  /*  You can apply default styles and class names to use by passing a 
      `stylesheets` array to `use`. You can even specify more than one file! */
  const { useName } = cnn.use({ stylesheets: [cssModule] });

  return (
    <div {...useName("ComponentName")}>
      <div {...useName("ComponentName__childElement")}>
        I'm this component's child!
      </div>
    </div>
  );
}
```

`component-classnames` works by giving each element inside a component a unique name, and remembering information about how to style that component. When using CSS modules, the name you choose must match a class name in the stylesheet. For this reason, it's a good idea to use some sort of CSS naming convention to give elements in components unique names. BEM is recommended, since it's simple to start using and `component-classNames` already uses BEM-like syntax to create modifiers for elements (discussed in the next section). Consistent, unique naming may also help styling nested components in the future.

The `useName` function simply returns an object with a `className` and `style` property. When using the spread operator (`...`), all that happens is an assignment of those properties to a React element.

If you don't desire to use CSS Modules, `component-classNames` may still be a usable option.
You may specify default classNames to the `use` function as well, without a stylesheet. This may be useful for applying things like TailWind classes:

```jsx
import ccn from "component-classnames";

const defaultStyles = {
  classNames: {
    Component: ["text-lg", "font-semibold"],
    Component__child: ["bg-sky-500", "hover:bg-sky-700"],
  },
};

function Component() {
  const { useName } = cnn.use(defaultStyles);

  return (
    // applies string 'text-lg font-semibold' to container className
    <div {...useName("Component")}>
      {/* applies string 'bg-sky-500 hover:bg-sky-700' to child className*/}
      <div {...useName("Component__child")}>I'm this component's child!</div>
    </div>
  );
}
```

> Note:
> While you _can_ currently provide a single long string in the classNames array above for applying TailWind classes, instead a single string for each class, it's quite likely your classes will not be de-duplicated properly (this may be important when overriding default styling). Furthermore, there is no guarauntee that it continue to work.
> A good middle-ground solution might be to `.split` a long string by whitespace into an array when passing it into `classNames` to ease in writing many class names.

If you _still_ don't want to work with class names, you can use `component-classnames` to apply default inline-css to components as well.

`component-classNames` uses React's CSSProperties type, so if you use TypeScript, you'll get type-checking and auto-completion in editors like VSCode.

```js
const defaultStyles = {
  styles: {
    Component: {
      display: "flex",
      padding: "1em",
      backgroundColor: "gainsboro",
    },
    Component__child: {
      color: "rebeccapurple",
    },
  },
};

function Component() {
  const { useName } = cnn.use(defaultStyles);

  return (
    // applies specified styles object to container's `style` property
    <div {...useName("Component")}>
      {/* applies specified styles object to child's `style` property */}
      <div {...useName("Component__child")}>I'm this component's child!</div>
    </div>
  );
}
```

The `use` function also returns two other helper functions named `classNames` and `styles`. They are available just in case you want to apply the `className` and `style` properties of an element separately. They work the same way, except they return a string or a `CSSProperties` object respectively. This can be useful for class names/styles that should be applied conditionally.

A current limitation of `component-classnames` is that it's hard use modifiers to style a component based on some condition (state or props), while maintaining the desired benefits. For this reason, we recommend creating a new class name for when a component gets re-styled based on some condition (in other words, treating it as a unique element of it's block).

```jsx
// Normal BEM convention:
<div className={ selected ? 'Component__child Component__child--selected' : 'Component__child'} />

// Recommended convention while using `component-classnames`
<div {...( selected ? useName('Component__child') : useName('Component_selectedChild'))} />
```

While this means you may have to duplicate some code in CSS, reusable components are often small. This convention makes it easier for consumers of components to re-style selected and unselected elements as desired, and seems to be the best solution given other alternatives.

When using `component-classnames`, modifiers should be used only as a way for the consumer of a component to modify an element from the outside, and purely for stylistic reasons. More on modifiers below.

## Modifiers (choosing from a selection of default styles)

`component-classnames` supports the BEM naming convention for applying 'modifiers' to your components and their child elements from the outside. These modifiers can be especially useful for applying quick layout changes from pre-defined style modifiers. Currently, there is no option to change this convention, but one may be provided in the future.

```css
/* Component.module.css */
.Component {
  display: flex;
  padding: 1em;
  background-color: gainsboro;
}

.Component__child {
  color: rebeccapurple;
}

/* A 'columns' modifier is defined here, which can be used to change the layout of the component*/
/* large layout changes such as this are one of the best use-cases for applying modifiers */
.Component--column {
  flex-direction: column;
}
```

```jsx
// Component.jsx
import cssModule from "./Component.module.css";

function Component({ customCSS = {} }) {
  // You can modify styles from props by telling the `use` function to use an additional config object
  // The `use` function will merge the two configurations and apply styling based on them.
  const { useName } = cnn.use({ stylesheets: [cssModule] }, customCSS);

  return (
    // The `classNames` function will automatically apply any modifiers passed to the `use` function
    <div {...useName("Component")}>
      <div {...useName("Component__child")}>I'm this component's child!</div>
    </div>
  );
}
```

```jsx
// App.jsx
import Component from "./Component.jsx";
function App() {
  return (
    <div className="App">
      {/*
        This tells the component to apply the `column` modifier to the element
        using the `Component` name, shifting the layout with ease.

        If a component requires extensive restyling on one or more pages, you
        could add a modifier on the container with the page's name to quickly
        modify a component to suit the page's needs without effecting other
        pages.
      */}
      <Component customCSS={{ modifiers: { Component: "column" } }} />
    </div>
  );
}
```

The good news, for those that may be wary the verbosity of BEM, is that `component-classnames` makes using one likely less verbose than one would expect inside a component.

The `classNames` function will automatically apply modifiers for you based on props, so you may never need to actually specify them yourself inside a component. `component-classnames` encourges you to use modifiers sparingly, as a way for a consumer of your components to make swift modifications to them.

If you're not using CSS modules, you can still provide modifier classes by specifying them in a configuration object that gets passed to `use`:

```js
{
  classNames: {
    Component: [/* some classes to apply for a non-modified element */],
    'Component--column': [/* some classes to apply for modified element */]
  }
}
```

This modifier can be applied the exact same way through props.

## Extending or overwriting default styles through props

It's easy to extend or overwrite default styles on specific elements in a component through props.

You can apply additional styles/class names to specific elements via the `classNames` and `styles` config options:

```jsx
// Component.jsx
import cssModule from "./Component.module.css";
function Component({ customCSS = {} }) {
  const { useName } = cnn.use({ stylesheets: [cssModule] }, customCSS);
  return (
    <div {...useName("Component")}>
      <div {...useName("Component__child")}>I'm this component's child!</div>
    </div>
  );
}
```

```jsx
// change the child's background color via inline styles
<Component customCSS={ {styles: { Component__child: { backgroundColor: 'white' } } } }>
```

```jsx
// apply additional classes to any element by passing them in via props
<Component customCSS={{ classNames: { Component__child: ['some-additional-class'] } } }>
```

This can be more powerful when you realize that you can map properties from a CSS module in a different component to restyle a reusable one. This lets you optionally add to a reusable component's styles when you're writing the styles for it's parent:

```jsx
import AppStyles from './App.module.css'
function App() {
  return (
    <Component customCSS={{ classNames: { Component__child: [AppStyles.Component__child] } }}>
  )
}
```

You can actually just pass in `AppStyles` itself as a stylesheet, and if it has class names matching the names of the elements in `Component`, the `useName`/`classNames` helper will automatically apply those classes as well as the original ones:

```js
import AppStyles from './App.module.css'
function App() {
  return (
    <Component customCSS={{ stylesheets: [AppStyles] }}>
  )
}
```

Conflicting class names from different CSS modules can have unpredictable results, unfortunately. If you're going to do the above, it might be a good idea to set the `unstyled` property of the config object to `true`. This is wipe out all previous styles, and allow you to specify an alternative stylesheet to completely restyle a component without conflicts:

```js
// import a stylesheet that also specified styles for the nested component
import AppStyles from "./App.module.css";

/*
You could also write an alternative stylesheet if you don't want to mix the styles in one CSS module:
import alternativeComponentStyles from './alternativeComponentStyles.module.css'
*/
function App() {
  return <Component customCSS={{ unstyled: true, stylesheets: [AppStyles] }} />;
}
```

## Completely restyle a component through props

Shown above, the `unstyled` config option tells `use` to ignore all styling information it recieved previously. This allows you to immediately and easily remove all styles and start fresh, if you wanted to for whatever reason.

## Dynamically apply class names to elements inside 'block box' components from outside the component

`component-classNames` uses the deduped version of the `classnames` package underneath the hood. This means that the `classNames` config property let's you specify anything that the `classnames` package could understand.

This can allow you to easily conditionally apply styles to elements of a component from outside of it, without direct acceess to the element, if for some reason you desired to.

```jsx
<Component
  customCSS={{
    classNames: {
      Container: [
        // you can pass nested arrays and objects to this array
        "something",
        ["some", "other", "things"],
        { conditionalClassName: someCondition ? true : false },
      ],
    },
  }}
/>
```

Something that's probably more useful though, is the ability to overwrite conditional styles that are placed on an element from inside a component from the outside:

```jsx
import cssModule from "./Component.module.css";
import ccn from "./component-classnames";

function Component({ renderList = [], customCSS = {}, ...props }) {
  const [selected, setSelected] = useState(null);
  const {styles} = ccn.use({stylesheets: [cssModule]}, customCSS);

  return (
    <div className={classNames("Component")}>
      <ul>
        {renderList.map((item) => (
          <li
            key={item.id}
            {...(selected === item.id ? useName('Component__listItemSelected') : useName('Component__listItem'))}
            onClick={() => setSelected(item.id)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const data = [
    {id: 0, text: 'a'},
    {id: 1, text: 'b'},
    {id: 2, text: 'c'},
    {id: 3, text: 'd'},
  ]
  return (
    <div className='App'>
      <Component renderList={data} customCSS={CustomCSS({
        // use styles to apply inline styles directly for only selected elements
        styles: {
          "Component__listItemSelected": {backgroundColor: 'gray'}
        }
      })}>
    </div>
  )
}
```

## Modify the styles of nested components:

In the future, an API for this might take in additional CustomCSS objects to
style nested components. This would be verbose, but I'm unsure of a better way.

It may look something like this:

```js
// Component.jsx
import cssModule from "./Component.module.css";
import ccn from "component-classnames";

const defaultStyle = ccn.CustomCSS({
  stylesheets: [cssModule],
  childComponents: {
    AnotherComponent: CustomCSS(stylesheets: [cssModule])
  }
});

function Component({ customCSS = {}, ...props }) {
  const { useName,  childComponents } = ccn.use(defaultStyle, customCSS);

  return (
    <div {...useName("Component")}>
      <div {...useName("Component__child")}> </div>
      {/*
        This function call might:
        1. Pass a consumer-defined CustomCSS object to AnotherComponent if the consuming component's `CustomCSS.childComponents` property specifies one
        2. Pass a 'default' CustomCSS object if it does not
        3. Pass a CustomCSS object with the `unstyled` property set to `true` if the consuming component's `unstyled` property is set to true. (maybe, purely using the CustomCSS object may afford more granularity. May depend on feedback. Ideally, to me, `unstyled: true` should wipe every style in a component)
      */}
      <AnotherComponent customCSS={childComponents("AnotherComponent")} />
    </div>
  )
}

// App.jsx
import cssModule from "./App.module.css";

function App() {
  return (
    <Component
      customCSS={CustomCSS({
        childComponents: {
          AnotherComponent: CustomCSS({
            /* Options for styling a nested component... */
            /* set unstyled to true to avoid conflicts */
            unstyled: true,
            /* Set an alternative stylesheet */
            /* I'd hope someone would use a stylesheet if they need to modify styles this much... */
            stylesheets: [cssModule]
          }),
        }
      })}
    />
  )
}
```
