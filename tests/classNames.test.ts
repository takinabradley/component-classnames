import ccn from '../src/ComponentClassnames.ts'
import { it, describe, expect } from 'bun:test'

const stylesheet1 = {
  Component: 'hashed-component-name',
  Component__child: 'hashed-child_component-name',
  'Component__child--mod': 'MODDED!'
}

const stylesheet2 = {
  Block: 'hashed-block-name',
  Block__child: 'hashed-child_element-name'
}

describe('`classNames` function', () => {
  describe('uses CSS modules as expected', () => {
    it('uses correct classname from stylesheet', () => {
    const customCSS = ccn.CustomCSS({ stylesheets: [stylesheet1] })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Component')).toBe('hashed-component-name')
  })

    it('uses classnames from stylesheet in conjunction with classNames listed in CustomCSS `classNames` property', () => {
    const customCSS = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      classNames: { Component: ['another-class-name'] }
    })

    const { classNames } = ccn.use(customCSS)

    expect(classNames('Component')).toBe('hashed-component-name another-class-name')
  })

    it("ignores previous stylesheets if a subsequent CustomCSS object's `unstyled` property is `true`", () => {
    const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1] })
    const customCSS2 = ccn.CustomCSS({ unstyled: true })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Component')).toBe('')
  })

    it('uses stylesheets in subsequent CustomCSS objects (even if subsequent object has `unstyled` set to `true`)', () => {
    const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1] })
    const customCSS2 = ccn.CustomCSS({ unstyled: true, stylesheets: [stylesheet2] })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Block')).toBe('hashed-block-name')
  })

    it('can use more than one stylesheet', () => {
     const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1] })
      const customCSS2 = ccn.CustomCSS({ stylesheets: [stylesheet2] })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
      expect(classNames('Block')).toBe('hashed-block-name')
      expect(classNames("Component")).toBe('hashed-component-name')
    })
  })
})

