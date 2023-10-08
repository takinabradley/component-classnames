import type { CSSProperties } from 'react'
import cnDedupe from 'classnames/dedupe'
import type classNames from 'classnames/dedupe'


/* 
  CustomCSS Factory.

  Apparently it's hard to export a function and type of the same name from a 
  file with TS, so this code now sits here.
*/


// I want this to be the main object type I'm working with
export type CustomCSS = {
  // a flag used to ignore previous CustomCSS properties on a component
  unstyled: boolean

  /*
    When searching for a className to apply to an element, this utility should
    search all stylesheets and the `classNames` property that matches it's name
  */
  stylesheets: CSSModuleClasses[]
  classNames: ClassNameMap

  /* Used to apply inline styles */
  styles: CSSPropertiesMap

  /*
    Modifiers should also search the stylesheets and classNames property for 
    maximum flexibility
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

export interface CustomCSSConfig {
  unstyled?: boolean
  stylesheets?: CSSModuleClasses[]
  classNames?: ClassNameMap
  styles?: CSSPropertiesMap
  modifiers?: ModifiersMap
}

function CustomCSS(config?: CustomCSSConfig): CustomCSS {
  return {
    unstyled: config?.unstyled || false,
    stylesheets: config?.stylesheets || [],
    classNames: config?.classNames || {},
    styles: config?.styles || {},
    modifiers: config?.modifiers || {}
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


/*
  CustomCSS merge utilities
*/


function mergeClassNames(customCSS1: CustomCSS, customCSS2: CustomCSS): ClassNameMap {
  const mergedClassNames: ClassNameMap = {}
  for (const key in customCSS2.classNames) {
    // IMPROVEMENT?: could probably dedupe this and not rely on cnDedupe....?
    const originalClassNames = customCSS1.classNames[key] || []
    const newClassNames = customCSS2.classNames[key] || []
    mergedClassNames[key] = [...originalClassNames, ...newClassNames]
  }
  return {...customCSS1.classNames, ...mergedClassNames}
}

function mergeStyles(customCSS1: CustomCSS, customCSS2: CustomCSS): CSSPropertiesMap {
  const newStyles: CSSPropertiesMap = {}
  for (const key in customCSS2.styles) {
    newStyles[key] = { ...customCSS1.styles[key], ...customCSS2.styles[key] }
  }
  return newStyles
}

function mergeModifiers(customCSS1: CustomCSS, customCSS2: CustomCSS): ModifiersMap {
  const mergedModifiers: ModifiersMap = {}
  for (const key in customCSS2.modifiers) {
    const originalModifiers = customCSS1.modifiers[key] || []
    const newModifiers = customCSS2.modifiers[key] || []
    mergedModifiers[key] = [...originalModifiers, ...newModifiers]
  }
  return mergedModifiers
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


/*
  Core 'use' function to merge and use information from CustomCSS objects
*/


function getClassNamesFromStylesheets(customCSS: CustomCSS, elementName: string) {
  const classNames: string[] = []
  customCSS.stylesheets.forEach(stylesheet => {
      if(stylesheet[elementName]) classNames.push(stylesheet[elementName])
  })
  return classNames
}

function getClassNamesFromModifiers(customCSS: CustomCSS, elementName: string): cnDedupe.ArgumentArray {
  const classNames: cnDedupe.ArgumentArray = []
  if (customCSS.modifiers[elementName]) {
    customCSS.modifiers[elementName].map(mod => {
      const fullModifier = `${elementName}--${mod}`
      const styleSheetModifiers = getClassNamesFromStylesheets(customCSS, fullModifier)
      const classNameModifiers = customCSS.classNames[fullModifier] || []
      classNames.push(...styleSheetModifiers, ...classNameModifiers)
    })
  }
  
  return classNames
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
    const modifierNames = getClassNamesFromModifiers(customCSS, elementName)
    const allNames = cnDedupe([...cssModuleNames, ...classNameNames, ...modifierNames])
    return allNames
  }

  
  const styles = (componentName: string): CSSProperties => customCSS.styles[componentName] || {}

  // FIXME, SOMEHOW: this won't grab modifications from a CSS module properly
  // const modifiers = (componentName: string) => customCSS.modifiers[componentName].map(mod => `${componentName}--${mod}`)

  // Fixed? -- maybe add this functionality directly to the 'classNames' function, so no conditional logic is actually needed in a component to utilize modifiers?
  /* const modifiers = (elementName: string): string => {
    return cnDedupe(
      // if nothing is found on the stylesheets, it might be nice for it to check 'classNames' for a modifier
      customCSS.modifiers[elementName].map(mod =>
        getClassNamesFromStylesheets(customCSS, `${elementName}--${mod}`)
      )
    )
  } */

  return {
    unstyled, classNames, styles
  }
}

export default {
  CustomCSS,
  use
}
