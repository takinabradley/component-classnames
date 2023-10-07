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
