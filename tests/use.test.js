import ccn from '../src/ComponentClassnames.ts'

/*  
    `ccn.use` should provide an easy way to map classes and styles from 
    a CustomCSS object to an actual element

    Currently, it's usage is idiomatic to React hooks- it takes in a list of
    CustomCSS objects, and reveals an interface for applying styles/classes.
*/
describe('`use` function', () => {
  it('Creates object with expected functions', () => {
    const ccnController = ccn.use(ccn.CustomCSS())

    expect(typeof ccnController.classNames).toBe('function')
    expect(typeof ccnController.styles).toBe('function')
    expect(typeof ccnController.unstyled).toBe('function')
  })
})