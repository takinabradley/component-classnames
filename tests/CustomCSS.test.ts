import ccn from '../src/ComponentClassnames.ts'
import type { CustomCSS } from '../src/ComponentClassnames.ts'
import { describe, test, expect } from 'bun:test'

const stylesheet1 = {
  Component: 'hashed-component-name',
  Component__child: 'hashed-child_component-name'
}

const stylesheet2 = {
  Block: 'hashed-block-name',
  Block__child: 'hashed-child_element-name'
}

/* 
  The CustomCSS object is meant to hold information about how to style a component.

  It requires a reliable interface, so that it can be easily merged with other CustomCSS objects when a user decides to override a component's styling.
*/
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