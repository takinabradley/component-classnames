import ccn from '../src/ComponentClassnames.ts'

describe('`use` function', () => {
  it('Creates object with expected functions', () => {
    const ccnController = ccn.use(ccn.CustomCSS())

    expect(typeof ccnController.classNames).toBe('function')
    expect(typeof ccnController.styles).toBe('function')
    expect(typeof ccnController.modifiers).toBe('function')
    expect(typeof ccnController.unstyled).toBe('function')
  })
})