import CustomCSS from "./CustomCSS"
import mergeCustomCSS from "./mergeCustomCSS"
import type { CSSProperties, CustomCSSConfig } from "./CustomCSS"
import cnDedupe from 'classnames/dedupe'

interface CCNController {
  classNames: (elementname: string) => string
  styles: (elementname: string) => CSSProperties,
  useName: (elementname: string) => {className: string, style: CSSProperties}
}

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

/*
  Core 'use' function to merge and use information from CustomCSS objects
*/

function use(...configs: CustomCSSConfig[]): CCNController {
  let mergedCustomCSS: CustomCSS
  if (configs.length === 0) {
    mergedCustomCSS = new CustomCSS()
  } else {
    const customCSSObjs = configs.map(config => new CustomCSS(config))
    mergedCustomCSS = mergeCustomCSS(...customCSSObjs)
  }

  const classNames = (elementName: string): string => {
    const cssModuleNames: string[] = getClassNamesFromStylesheets(mergedCustomCSS, elementName)
    const classNameNames = mergedCustomCSS.classNames[elementName] || []
    const modifierNames = getClassNamesFromModifiers(mergedCustomCSS, elementName)
    const allNames = cnDedupe([...cssModuleNames, ...classNameNames, ...modifierNames])
    return allNames
  }

  const styles = (elementName: string): CSSProperties => mergedCustomCSS.styles[elementName] || {}

  const useName = (elementName: string): {className: string, style: CSSProperties} => ({
    className: classNames(elementName),
    style: styles(elementName)
  })

  return {
    classNames,
    styles,
    useName
  }
}

export type { CustomCSS }

export default {
  use
}
