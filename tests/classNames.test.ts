import ccn from '../src/ComponentClassnames.ts'
import { it, describe, expect } from 'bun:test'

const stylesheet1 = {
  Component: 'hashed-component-name',
  Component__child: 'hashed-child_component-name'
}

const stylesheet2 = {
  Block: 'hashed-block-name',
  Block__child: 'hashed-child_element-name'
}

describe('`classNames` function', () => {
  it('grabs correct classname from stylesheet', () => {
    const customCSS = ccn.CustomCSS({ stylesheets: [stylesheet1] })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Component')).toBe('hashed-component-name')
  })

  it('uses classnames from stylesheet and additional classnames in provided CustomCSS object', () => {
    const customCSS = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      classNames: { Component: ['another-class-name'] }
    })

    const { classNames } = ccn.use(customCSS)

    expect(classNames('Component')).toBe('hashed-component-name another-class-name')
  })

  it("doesn't use stylesheets from first CustomCSS object if the second CustomCSS object passed in has the `unstyled` property set to `true`", () => {
    const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1] })
    const customCSS2 = ccn.CustomCSS({ unstyled: true })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Component')).toBe('')
  })

  it("does use stylesheets from second CustomCSS object even if the second CustomCSS object's `unstyled` property is set to `true`", () => {
    const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1] })
    const customCSS2 = ccn.CustomCSS({ unstyled: true, stylesheets: [stylesheet2] })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Block')).toBe('hashed-block-name')
  })

  it("doesn't continue to use stylesheets from first CustomCSS object if second CustomCSS object uses stylesheets and has it's `unstyled` property set to `true`", () => {
     const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1] })
    const customCSS2 = ccn.CustomCSS({ unstyled: true, stylesheets: [stylesheet2] })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Component')).toBe('')
  })
})

