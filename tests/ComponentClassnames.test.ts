import ccn from '../src/ComponentClassnames.ts'
import type { CustomCSS } from '../src/ComponentClassnames.ts'
import { it, describe, test, expect } from 'bun:test'

const stylesheet1 = {
  Component: 'hashed-component-name',
  Component__child: 'hashed-child_component-name'
}

const stylesheet2 = {
  Block: 'hashed-block-name',
  Block__child: 'hashed-child_element-name'
}

describe('CustomCSS constructor', () => {

  test('Creates expected object with no arguments', () => {
    const customCSS: CustomCSS = ccn.CustomCSS()

    expect(customCSS).toEqual({
      unstyled: false,
      stylesheets: [],
      classNames: {},
      styles: {},
      modifiers: {}
    })
  })

  test("correctly assigns object passed-in values", () => {
    const customCSS1 = ccn.CustomCSS({ stylesheets: [stylesheet1, stylesheet2] })
    const customCSS2 = ccn.CustomCSS({
      classNames: {
        Thing: ['class1', { class2: true }]
      },
      modifiers: {
        Thing: ['hello']
      }
    })
    const customCSS3 = ccn.CustomCSS({
      styles: {
        Block: {
          backgroundColor: 'green'
        }
      },
      unstyled: true
    })

    expect(customCSS1).toEqual({
      unstyled: false,
      stylesheets: [stylesheet1, stylesheet2],
      classNames: {},
      styles: {},
      modifiers: {}
    })

    expect(customCSS2).toEqual({
      unstyled: false,
      stylesheets: [],
      classNames: {
        Thing: ['class1', { class2: true }]
      },
      styles: {},
      modifiers: {
        Thing: ['hello']
      }
    })

    expect(customCSS3).toEqual({
      unstyled: true,
      stylesheets: [],
      classNames: {},
      styles: {
        Block: {
          backgroundColor: 'green'
        }
      },
      modifiers: {}
    })
  })
})

describe('`use` function', () => {
  it('Creates object with expected functions', () => {
    const ccnController = ccn.use(ccn.CustomCSS())

    expect(typeof ccnController.classNames).toBe('function')
    expect(typeof ccnController.styles).toBe('function')
    expect(typeof ccnController.modifiers).toBe('function')
    expect(typeof ccnController.unstyled).toBe('function')
  })
})
