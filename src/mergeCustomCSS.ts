import CustomCSS from "./CustomCSS"
import type { ClassNameMap, CSSPropertiesMap, ModifiersMap } from "./CustomCSS"

function mergeClassNames(customCSS1: CustomCSS, customCSS2: CustomCSS): ClassNameMap {
  const mergedClassNames: ClassNameMap = {}
  for (const key in customCSS2.classNames) {
    const originalClassNames = customCSS1.classNames[key] || []
    const newClassNames = customCSS2.classNames[key]
    mergedClassNames[key] = [...originalClassNames, ...newClassNames]
  }
  return {...customCSS1.classNames, ...mergedClassNames}
}

function mergeStyles(customCSS1: CustomCSS, customCSS2: CustomCSS): CSSPropertiesMap {
  const mergedStyles: CSSPropertiesMap = {}
  for (const key in customCSS2.styles) {
    const oldStyles = customCSS1.styles[key] || {}
    const newStyles = customCSS2.styles[key]
    mergedStyles[key] = { ...oldStyles, ...newStyles }
  }
  return {...customCSS1.styles, ...mergedStyles}
}

function mergeModifiers(customCSS1: CustomCSS, customCSS2: CustomCSS): ModifiersMap {
  const mergedModifiers: ModifiersMap = {}
  for (const key in customCSS2.modifiers) {
    const originalModifiers = customCSS1.modifiers[key] || []
    const newModifiers = customCSS2.modifiers[key]
    mergedModifiers[key] = [...originalModifiers, ...newModifiers]
  }
  return {...customCSS1.modifiers, ...mergedModifiers}
}

export default function mergeCustomCSS(...customCSSObjs: CustomCSS[]): CustomCSS {
  return customCSSObjs.reduce<CustomCSS>((merged, current) => {
    // if `current` requests unstyled, then just use arguments from the current CustomCSS
    // We *DON'T* return `current` directly, because we don't want to accidentally write to current on a next pass.
    if (current.unstyled) return { ...current }
    
    merged.unstyled = current.unstyled
    merged.stylesheets = [...merged.stylesheets, ...current.stylesheets]
    merged.classNames = mergeClassNames(merged, current)
    merged.styles = mergeStyles(merged, current)
    merged.modifiers = mergeModifiers(merged, current)
    return {...merged}

  }, new CustomCSS())
}