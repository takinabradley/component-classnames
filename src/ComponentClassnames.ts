import type { CSSProperties } from 'react'
import cnDedupe from 'classnames/dedupe'
import type classNames from 'classnames/dedupe'

// I want this to be the main object type I'm working with
interface CustomCSS {
  unstyled: boolean // should unstyle a component and allow completely custom styling

/*   STYLESHEETS:
        USTYLED TRUE -> COPY ONLY PROVIDED STYLESHEETS FROM CURRENT
        USTYLED FALSE -> KEEP BOTH

        FOR CLASSNAMES, LOOK UP ELEMENT NAME ON PROVIDED STYLESHEETS FIRST, IF IT EXISTS USE IT, THEN ADD OTHER CLASSNAMES
        FOR MODIFIERS, LOOK UP ELEMENT NAME PROVIDED ON STYLESHEETS FIRST, IF IT EXISTS, USE MODIFIED VERSION OF IT.  */
  stylesheets: CSSModuleClasses[]

  /*
    unstyled: true -- should use only classnames given
    unstyled: false -- should extend default classnames
  */
  classNames: ClassNameMap

  /*
    unstyled: true -- should use only styles given
    unstyled: false -- should extend default styles
  */
  styles: CSSPropertiesMap

  /*
    unstyled: true -- should do nothing(? May have already changed)
    unstyled: false -- should add modifiers to the block-level (or any?) element
  */
  modifiers: ModifiersMap
}

type CSSModuleClasses = { readonly [key: string]: string }

interface ModifiersMap {
  [key: string]: string[]
}

interface ClassNameMap {
  [key: string]: classNames.ArgumentArray | undefined// | CustomCSS ? -- allow nesting? Or have a dedicated property for that? | 
}

interface CSSPropertiesMap {
  [key: string]: CSSProperties
}

interface CustomCSSConfig {
  unstyled?: boolean
  stylesheets?: CSSModuleClasses[]
  classNames?: ClassNameMap
  styles?: CSSPropertiesMap
  modifiers?: ModifiersMap
}

function mergeClassNames(customCSS1: CustomCSS, customCSS2: CustomCSS): ClassNameMap {
  const mergedClassNames: ClassNameMap = {}
  for (const key in customCSS2.classNames) {
    const thing = customCSS2.classNames[key]
    // IMPROVEMENT?: could probably dedupe this and not rely on cnDedupe....?
    const originalClassNames = customCSS1.classNames[key] || []
    const newClassNames = customCSS2.classNames[key] || []
    mergedClassNames[key] = [...originalClassNames, ...newClassNames]
  }
  return mergedClassNames
}

function mergeStyles(customCSS1: CustomCSS, customCSS2: CustomCSS): CSSPropertiesMap {
  const newStyles: CSSPropertiesMap = {}
  for (const key in customCSS2.styles) {
    newStyles[key] = { ...customCSS1.styles[key], ...customCSS2.styles[key] }
  }
  return newStyles
}

function mergeModifiers(customCSS1: CustomCSS, customCSS2: CustomCSS): ModifiersMap {
  const newModifiers: ModifiersMap = {}
  for (const key in customCSS2.modifiers) {
    newModifiers[key] = [...customCSS1.modifiers[key], ...customCSS2.modifiers[key]]
  }
  return newModifiers
}

function mergeCustomCSS(...customCSSObjs: CustomCSS[]): CustomCSS {
  return customCSSObjs.reduce<CustomCSS>((merged, current) => {
    // if `current` requests unstyled, then just use arguments from the current CustomCSS
    // We *DON'T* return `current` directly, because we don't want to accidentally write to current on a next pass.
    if (current.unstyled) return { ...current }
    
    merged.unstyled = current.unstyled
    merged.classNames = mergeClassNames(merged, current)
    merged.styles = mergeStyles(merged, current)
    merged.modifiers = mergeModifiers(merged, current)

    // I don't actually know how styles will behave like this..... I guess we'll find out!
    merged.stylesheets = [...merged.stylesheets, ...current.stylesheets]

    /* 
        STYLESHEETS:
        USTYLED TRUE -> COPY ONLY PROVIDED STYLESHEETS FROM CURRENT
        USTYLED FALSE -> KEEP BOTH

        FOR CLASSNAMES, LOOK UP ELEMENT NAME ON PROVIDED STYLESHEETS FIRST, IF IT EXISTS USE IT, THEN ADD OTHER CLASSNAMES
        FOR MODIFIERS, LOOK UP ELEMENT NAME PROVIDED ON STYLESHEETS FIRST, IF IT EXISTS, USE MODIFIED VERSION OF IT. 

        THIS MAY MAKE MODIFIER PROBLEM LESS COMPLEX AND MORE FLEXIBLE

        // iterate through array for property name on stylesheets first,
        // then apply any classnames in the 'classNames' array.

        // the classNames array should be applied as-is, with no key transformation....?
        
    */
    
    return {...merged}

  }, CustomCSS())
}

function getClassNamesFromStylesheets(customCSS: CustomCSS, elementName: string) {
  const classNames: string[] = []
  customCSS.stylesheets.forEach(stylesheet => {
      if(stylesheet[elementName]) classNames.push(stylesheet[elementName])
  })
  return classNames
}

function CustomCSS(config?: CustomCSSConfig): CustomCSS {
  if (!config) return { unstyled: false, stylesheets: [], classNames: {}, styles: {}, modifiers: {} }

  return {
    unstyled: config.unstyled || false,
    stylesheets: config.stylesheets || [],
    classNames: config.classNames || {},
    styles: config.styles || {},
    modifiers: config.modifiers || {}
  }

  // use in the future to ensure nothing gets modified? Might make merging harder..
  /* const unstyled = config?.unstyled || false
  const stylesheets = config?.stylesheets || []
  const classNames = config?.classNames || {}
  const styles = config?.styles || {}
  const modifiers = config?.modifiers || {}
  return {
    get unstyled() { return unstyled },
    get stylesheets() { return stylesheets },
    get classNames() { return classNames },
    get styles() { return styles },
    get modifiers() {return modifiers}
  } */
}

function use(...customCSSObjs: CustomCSS[]) {
  const customCSS = mergeCustomCSS(...customCSSObjs)

  const unstyled = () => customCSS.unstyled

  // OLD: grabs everything from classNames array
  // const classNames = (componentName: string): string => cnDedupe(customCSS.classNames[componentName])

  // NEW: checks stylesheets for classNames, then adds any additional classnames from classNames array
  const classNames = (elementName: string): string => {
    const cssModuleNames: string[] = getClassNamesFromStylesheets(customCSS, elementName)
    const classNameNames = customCSS.classNames[elementName] || []
    const allNames = cnDedupe([...cssModuleNames, ...classNameNames])
    return allNames
  }

  
  const styles = (componentName: string): CSSProperties => customCSS.styles[componentName] || {}

  // FIXME, SOMEHOW: this won't grab modifications from a CSS module properly
  // const modifiers = (componentName: string) => customCSS.modifiers[componentName].map(mod => `${componentName}--${mod}`)

  // Fixed? -- maybe add this functionality directly to the 'classNames' function, so no conditional logic is actually needed in a component to utilize modifiers?
  const modifiers = (elementName: string): string => {
    return cnDedupe(
      // if nothing is found on the stylesheets, it might be nice for it to check 'classNames' for a modifier
      customCSS.modifiers[elementName].map(mod =>
        getClassNamesFromStylesheets(customCSS, `${elementName}--${mod}`)
      )
    )
  }

  return {
    unstyled, classNames, styles, modifiers
  }
}

function fromStylesheets(...stylesheets: CSSModuleClasses[]): CustomCSS {
  return CustomCSS({stylesheets: stylesheets})
}

// class customcss with static methods?

export default {
  CustomCSS,
  fromStylesheets,
  use
}
