import classNames from "classnames/dedupe"
import type { CSSProperties } from "react"

export type { CSSProperties }
export type CSSModuleClasses = { readonly [key: string]: string }

export interface ModifiersMap {
  [key: string]: string[]
}

export interface ClassNameMap {
  [key: string]: classNames.ArgumentArray // | CustomCSS ? -- allow nesting? Or have a dedicated property for that? | 
}

export interface CSSPropertiesMap {
  [key: string]: CSSProperties
}

export interface CustomCSSConfig {
  unstyled?: boolean
  stylesheets?: CSSModuleClasses[]
  classNames?: ClassNameMap
  styles?: CSSPropertiesMap
  modifiers?: ModifiersMap
}

class CustomCSS {
  unstyled: boolean
  stylesheets: CSSModuleClasses[]
  classNames: ClassNameMap
  styles: CSSPropertiesMap
  modifiers: ModifiersMap

  constructor(config?: CustomCSSConfig) {
    this.unstyled = config?.unstyled || false
    this.stylesheets = config?.stylesheets || []
    this.classNames = config?.classNames || {}
    this.styles = config?.styles || {}
    this.modifiers = config?.modifiers || {}
  }
}


export default CustomCSS