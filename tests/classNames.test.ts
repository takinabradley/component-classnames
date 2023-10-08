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

/* 
  The `classNames` function should use information from the current CustomCSS 
  objects to correctly apply desired classNames to elements in a convenient way.
*/

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

  it('can apply selected modifiers from stylesheets', () => {
    const customCSS1 = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      modifiers: {
        'Component__child': ['mod']
      }
    })
    const { classNames } = ccn.use(customCSS1)
    expect(classNames('Component__child')).toBe('hashed-child_component-name MODDED!')
  })

  it("doesn't erroneously apply modifiers for all elements from stylesheets when modifiers are present", () => {
    const customCSS1 = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      modifiers: {
        'Component__child': ['mod'],
      }
    })
    const { classNames } = ccn.use(customCSS1)
    expect(classNames('Component')).toBe('hashed-component-name')
  })

  it("doesn't apply modifiers from stylesheets that don't exist", () => {
    const customCSS1 = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      modifiers: {
        'Component': ['mod'],
      }
    })
    const { classNames } = ccn.use(customCSS1)
    expect(classNames('Component')).toBe('hashed-component-name')
  })

  it('applies all modifiers correctly from stylesheets and classNames property', () => {
    const customCSS1 = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      classNames: {
        'Component__child--mod': ['another-mod']
      },
      modifiers: {
        'Component__child': ['mod'],
      }
    })
    const { classNames } = ccn.use(customCSS1)
    expect(classNames('Component__child')).toBe('hashed-child_component-name MODDED! another-mod')
  })

  it("doesn't break when subsequent CustomCSS objects remove modifiers", () => {
    const customCSS1 = ccn.CustomCSS({
      stylesheets: [stylesheet1],
      classNames: {
        'Component__child--mod': ['another-mod']
      },
      modifiers: {
        'Component__child': ['mod'],
      }
    })

    const customCSS2 = ccn.CustomCSS({ unstyled: true, classNames: {Component__child: ['overwritten']} })
    
    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Component__child')).toBe('overwritten')
  })
})

describe('uses classNames property as expected', () => {
  it('pulls classes from CustomCSS objects without stylesheets', () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: ['Block']
      }
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('Block')
  })

  it('applies multiple classes to an element', () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: ['Block', 'Component']
      }
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('Block Component')
  })

  it('applies modifiers from classNames property', () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: ['Block', 'Component'],
        'Block--red': ['red']
      },
      modifiers: {
        Block: ['red']
      }
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('Block Component red')
  })

  it("doesn't break with nested arrays or objects", () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: [['Block', 'Component'], 'My-Component', { Container: false }],
        'Block--red': ['red']
      },
      modifiers: {
        Block: ['red']
      }
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('Block Component My-Component red')
  })

  it('dedupes classNames', () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: ['Block Block', 'Block', {Block: true}, ['Block', 'Block']],
      }
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('Block')
  })

  it('dedupes modifiers', () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: ['Block'],
        'Block--red': ['red']
      },
      modifiers: {
        Block: ['red', 'red', 'red', 'red']
      }
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('Block red')
  })

  it("can remove classNames in the dedupe process", () => {
    const customCSS = ccn.CustomCSS({
      classNames: {
        Block: ['Block', {Block: false}],
      },
    })

    const { classNames } = ccn.use(customCSS)
    expect(classNames('Block')).toBe('')
  })

  it('can remove classNames in the dedupe process when multiple CustomCSS objects are used', () => {
    const customCSS1 = ccn.CustomCSS({
      classNames: {
        Block: ['Block'],
        child: ['hello']
      },
    })

    const customCSS2 = ccn.CustomCSS({
      classNames: {
        Block: [{Block: false}]
      }
    })

    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Block')).toBe('')
    expect(classNames('child')).toBe('hello')
  })

  it('keeps previous properties when used with multiple CustomCSS objects', () => {
    const customCSS1 = ccn.CustomCSS({
      classNames: {
        Block: ['Block'],
        child: ['hello']
      },
    })

    const customCSS2 = ccn.CustomCSS({classNames: {}})

    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Block')).toBe('Block')
    expect(classNames('child')).toBe('hello')
  })

  it('ignores previous properties when multiple CustomCSS objects are used AND the unstyled flag is `true`', () => {
    const customCSS1 = ccn.CustomCSS({
      classNames: {
        Block: ['Block'],
        child: ['hello']
      },
    })

    const customCSS2 = ccn.CustomCSS({unstyled: true})

    const { classNames } = ccn.use(customCSS1, customCSS2)
    expect(classNames('Block')).toBe('')
    expect(classNames('child')).toBe('')
  })
  
})

