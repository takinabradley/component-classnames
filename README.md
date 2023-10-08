# Component-Classnames

component-classnames is a library meant to aid in shipping reusable components with flexible, default stylings.
This means that reusable components should:

1. Come with default styles
2. Have modifiers that allow easily extending default styles for common layout changes.
3. Have built-in way to extend or overwrite default styles from the consumer of the component
4. Have a built-in way to wipe default styling and apply completely custom styling from the consumer of the component
5. Have a way to apply dynamic stylings from outside the component(?)
6. If a reusable component uses other components, those components must also be considered reusable and adhere to these rules. Child components should be able to be re-styled from the root component (as easily as possible). Unstyling a root component should also un-style child components.

## Why follow the above rules?

It may provide a bottom-up way of styling for a reusable components. A component could ship with it's default styles anywhere, and be easily modified by anyone who wants to use it.

# Step 1: Applying default styles

component-classnames uses a `CustomCSS` object as the primary way to communicate style information to components.
The easiest way to use component-classnames is via CSS modules, but it's not required.

A `CustomCSS` object looks like the following:

```ts
interface CustomCSS {
  unstyled: boolean;
  stylesheets: CSSModuleClasses[]
  classNames: ClassNameMap
  styles: CSSPropertiesMap
  modifiers: ModifiersMap
}

const css: CustomCSS = {
  // is used to tell a component whether to use extend from default styles or not
  unstyled: false,
  stylesheets: [/*list of CSS module imports to use*/]
  // used to apply classnames to a component and/or it's children
  classNames: {
    RootComponent: ["a-class-to-apply"],
    childElement: ["another-class-to-apply"],
  },
  // used to apply raw styles to a component and/or it's children
  styles: {
    RootComponent: {backgroundColor: 'gainsBoro', padding: '1em'},
    childElement: {color: 'rebeccapurple'}
  }
  // used to apply general modifiers to a component and/or it's children
  modifiers: {
    RootComponent: ['red', 'column-layout']
  }
};
```

component-classnames can easily accept and apply classNames from CSS modules.

```js
import cssModule from "./Component.module.css";
import ccn from "./component-classnames";

// pass stylesheets into CustomCSS constructor
const defaultStyle = ccn.CustomCSS({ stylesheets: [cssModule] });

function Component() {
  // use of the library is idiomatic to React hooks
  // Just pass in a default CustomCSS object to the `use` function to use it.
  const { unstyled, classNames, styles } = ccn.use(defaultStyle);

  return (
    /* use 'classNames' helper function to apply classnames from the stylesheet, and more */
    /* The below elements will get the hashed classnames from the CSS module */
    <div className={classNames("ComponentName")}>
      <span className={classNames("ChildName")}>I'm a child!</span>
    </div>
  );
}
```

# Step 2: Modifiers for easy layout changes

Modifiers are a great way to take chunks of reusable markup, and apply alternative styling to them. component-classnames has a built-in method of applying modifiers to elements. This idea was taken from the BEM naming convention. If you're not familiar with BEM, read about it here!

Consider the following CSS file:

```css
/* Component.module.css */
.Block {
  display: flex;
  padding: 1em;
  background-color: gainsboro;
}

.child {
  color: rebeccapurple;
}

.Block--columns {
  /* Can apply modifiers to alter the layout, but otherwise keep normal 'Block' styling */
  flex-direction: column;
}
```

Now, by creating a component that uses this CSS file and accepts a CustomCSS object, we can apply this modifier whenever we want from outside the component

```js
import cssModule from "./Component.module.css";
import ccn from "./component-classnames";

// use the CustomCSS constructor to pass in stylesheets.
const defaultStyle = ccn.CustomCSS({ stylesheets: [cssModule] });

function Component({customCSS = CustomCSS(), ...props}) {
  /* the 'use' function merges CustomCSS objects passed in after the first one by default */
  const { unstyled, classNames, styles } = ccn.use(defaultStyle, customCSS);

  return (
    /* "Block" element's className becomes `${cssModule.Block} ${cssModule['Block--modified']}`, due to props passed in from App (below) */
    <div className={classNames("Block")}>
      <span className={classNames("child")}>I'm a child!</span>
    </div>
  );
}

function App() {
  return (
    // just create a CustomCSS object that specifies a modifier, and the `classNames` function in the component will do the rest!
    <Component
      customCSS={CustomCSS( {modifiers: {Block: 'columns'}} )}
    >
  )
}
```

# Step 3: Extending or overwriting default styles

New classNames and styles can easily be applied via a CustomCSS object with `stylesheet`, `classNames`, or `styles` props.

Let's say you wanted to add a simple inline style to an elmeent in your reusable component- you can do so with `styles`

```js
function App() {
  return (
    // Attaches inline styles to the "child" element in the component
    <Component
      customCSS={CustomCSS({
        styles: {
          child: {backgroundColor: 'rgba(156, 39, 176, 0.2)'}
        }
      })}
    >
  )
}
```

Or, if you're into tailwind-like utility classes, or have a global CSS file with custom utility classes, you can apply additional custom `classNames`:

```js
function App() {
  return (
    // appends additional classNames to the component, extending it's default classNames from the CSS module
    <Component
      customCSS={CustomCSS({
        classNames: {
          child: ['text-lg', 'font-semibold']
        }
      })}
    >
  )
}
```

You can even apply styles from another CSS module via the `stylesheet` property:

```scss
// App.module.css

/* ... App component styling up here somewhere ...*/

// Start of reusable component restyling:
.ComponentName {
  display: none;
}
```

```jsx
import cssModule from './App.module.css'

function App() {
  return (
    <div className="App">
      {/*
        Will apply classes matching the "Block" name to the "Block" element from
        App's css module.
      */}
      <ReusableComponent
        customCSS={CustomCSS({stylesheets: [cssModule]})}
      >

      {/*
        The above will apply additional classes from one CSS module to another
        CSS module. This can be a unpredictable, and may lead to unknown
        behavior if the classes clash with one another.

        For this reason, you may desire to use the `unstyled` property, and
        completely restyle the reusable component from the `App` component's own
        css module instead.

        Using the `unstyled` flag tells the `use` function that it should not
        merge the new CustomCSS object with the preceding one, allowing you
        freedom to restyle without clashes.
      */}
      <Component
        customCSS={CustomCSS({stylesheets: [cssModule]}, unstyled: true)}
      >

      {/*
        You may also explicitly apply specific styles from `App.module.css` to an
        element via `classNames`
      */}
      <Component
        customCSS={CustomCSS({
          classNames: { Block: [cssModule.anyClassYouWant]}
        })}
      >
    </div>
  )
}
```

# Step 4: Wipe default styling and apply completely custom styling

Mentioned in the previous step, it's very easy to apply your own completely
custom styles to a reusable component simply by using the `unstyled` property.

Everything would likely work as you'd suspect, except for the `modifiers`
function. When no stylesheets are present, this function will instead look to
the `classNames` property and search for modifiers that exist there.

Ex:

```jsx
function App() {
  return (
    <div className="App">
      {/*
        The `classNames` function inside of `Component` will also search the
        `classNames` property for `Block--red`, and apply the classNames it
        finds.
      */}
      <Component
        customCSS={CustomCSS({
          unstyled: true, // ignores all default styles on the component
          classNames: {
            Block: [/* classNames to apply to block */],
            child: [/* classNames to apply to child */],
            Block--red: [/*classNames to apply to a modified block*/]
          },
          modifiers: {
            Block: ['red'] // will apply classNames for 'Block--red' defined above
          }
        })}
      >

    </div>
  )
}
```

# Step 5: Dynamic styling

component-classNames uses the deduped version of the `classnames` package under the hood. That means you can pass in anything via an array that `classNames` supports. This allows you to apply some classNames dynamically from outside a component:

```js
function App() {
  const [dangerLevel, setDangerLevel] = useState(100)
  return (
    <div className="App">

      {/*
        You could combine this with props you might be sending to the component
        anyways
      */}
      <Component
        customCSS={CustomCSS({
          classNames: {
            child: [
              // applies the class 'red' to the `child` element conditionally
              {red: dangerLevel > 75 ? true : false}
            ]
          }
        })}
      >

    </div>
  )
}
```

An advantage of component-classnames is that you can also define what an 'selected'
class looks like to some component from an outside, even if the style is applied
based on some internal state:

Below, the 'selected' class/styles could be completely defined by the consumer
of the component, from outside of the component, in a variety of ways, if that
were required.

```jsx
import cssModule from "./Component.module.css";
import ccn from "./component-classnames";

const defaultStyle = ccn.CustomCSS({ stylesheets: [cssModule] });

function Component({ renderList = [], customCSS = CustomCSS(), ...props }) {
  const [selected, setSelected] = useState(null);
  const {styles} = ccn.use(defaultStyle, customCSS);

  return (
    <div className={classNames("Block")}>
      <ul>
        {renderList.map((item) => (
          <li
            key={item.id}
            {/*could use styles: */}
            styles={selected === item.id && styles("selected")}
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
        // use styles to apply inline styles directly
        styles: {
          selected: {backgroundColor: 'gray'}
        }
      })}>
    </div>
  )
}
```

# Step 6: Restyling nested components:

In the future, an API for this might take in additional CustomCSS objects to
style nested components. This would be verbose, but I'm unsure of a better way.

It may look something like this:

```js
// Component.jsx
import cssModule from "./Component.module.css";
import ccn from "./component-classnames";

const defaultStyle = ccn.CustomCSS({
  stylesheets: [cssModule],
  childComponents: {
    AnotherComponent: CustomCSS(stylesheets: [cssModule])
  }
});
function Component({ customCSS = CustomCSS(), ...props }) {
  const { unstyled, classNames, styles, childComponents } = ccn.use(
    defaultStyle,
    customCSS
  );

  return (
    <div className={classNames("Component")}>
      <div className={classNames("Component__child")} />

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
