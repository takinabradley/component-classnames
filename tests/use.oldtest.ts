import { test, describe, it, expect } from 'bun:test'
import ccn from '../src/ComponentClassnames.ts'

/*  
    `ccn.use` should provide an easy way to map classes and styles from 
    a CustomCSS object to an actual element

    Currently, it's usage is idiomatic to React hooks- it takes in a list of
    CustomCSS objects, and reveals an interface for applying styles/classes.
*/

describe('`use` function', () => {
  it('returns expected object when nothing is passed into it', () => {
    const { unstyled, classNames, styles, mergedCustomCSS } = ccn.use()
    expect(unstyled).toBeTypeOf('function')
    expect(classNames).toBeTypeOf('function')
    expect(styles).toBeTypeOf('function')
    expect(mergedCustomCSS).toEqual({
      unstyled: false,
      stylesheets: [],
      classNames: {},
      styles: {},
      modifiers: {}
    })
  })

  it('creates expected object when one or more arguments are passed in', () => {
    const { unstyled, classNames, styles, mergedCustomCSS } = ccn.use({}, {})
    expect(unstyled).toBeTypeOf('function')
    expect(classNames).toBeTypeOf('function')
    expect(styles).toBeTypeOf('function')
    expect(mergedCustomCSS).toEqual({
      unstyled: false,
      stylesheets: [],
      classNames: {},
      styles: {},
      modifiers: {}
    })
  })

  it('correctly creates mergedCustomCSS object with a single argument', () => {
    const {mergedCustomCSS} = ccn.use({
      unstyled: true,
      stylesheets: [{ Block: 'hashed-block' }],
      classNames: {
        Block: ['additional-classname']
      },
      styles: {
        Block: {backgroundColor: 'gray'}
      },
      modifiers: {
        Block: ['red']
      }
    })
    
    expect(mergedCustomCSS).toEqual({
      unstyled: true,
      stylesheets: [{ Block: 'hashed-block' }],
      classNames: {
        Block: ['additional-classname']
      },
      styles: {
        Block: {backgroundColor: 'gray'}
      },
      modifiers: {
        Block: ['red']
      }
    })

  })

  it('Creates object with expected functions', () => {
    const ccnController = ccn.use(ccn.CustomCSS())

    expect(typeof ccnController.classNames).toBe('function')
    expect(typeof ccnController.styles).toBe('function')
    expect(typeof ccnController.unstyled).toBe('function')
  })
})
