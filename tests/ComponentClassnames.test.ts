import { test, describe, it, expect } from 'bun:test'
import ccn from '../src/ComponentClassnames.ts'

const stylesheet1 = {
  Component: 'hashed-component-name',
  Component__child: 'hashed-child_element-name',
  'Component__child--mod': 'MODDED'
}

const stylesheet2 = {
  Component: 'another-hashed-component-name',
  Component__child: 'another-hashed-child_element-name',
  'Component__child--mod': 'MODDED-AGAIN'
}

const stylesheet3 = {
  Component: 'a-third-hashed-component-name',
  Component__child: 'a-third-hashed-child_element-name',
  'Component__child--mod': 'MODDED-THRICE'
}

const stylesheet4 = {
  Component: 'fight-me',
  Component__child: 'underscore_child',
}

describe('ControllerClassnames module', () => {
  it('exists', () => {
    expect(ccn).toBeTypeOf('object')
  })

  it('has expected interface', () => {
    expect(ccn).toHaveProperty('use')
  })
})

describe('`use` function', () => {
  it('creates expected object with no arguments', () => {
    const {classNames, styles} = ccn.use()
    expect(classNames).toBeTypeOf('function')
    expect(styles).toBeTypeOf('function')
  })

  it('creates expected object with one or more arguments', () => {
    const controllers = []
    controllers.push(
      ccn.use({
        unstyled: true,
        stylesheets: [{}],
        classNames: { Block: ['hashed-name'] },
        styles: { Block: { color: 'rebeccapurple' } },
        modifiers: {
          Block: ['background-red']
        }
      }),
      ccn.use({}, {}),
      ccn.use({ unstyled: true, stylesheets: [{ child: 'hashed-child-name' }] }),
      ccn.use(
        {
          stylesheets: [{ Block: 'hashed-block-name' }]
        },
        {
          unstyled: true,
          stylesheets: [{ child: 'hashed-child-name' }, { 'Block--modified': 'hashed-modified-block-name'}]
        },
        {
          classNames: { Block: ['new-name'] }
        }
      )
    )

    controllers.forEach(controller => {
      expect(controller.classNames).toBeTypeOf('function')
      expect(controller.styles).toBeTypeOf('function')
    })
  })
})

describe("`classNames` helper", () => {
  describe('uses provided stylesheets as expected', () => {
    it('applies class names from a provided stylesheet', () => {
      const { classNames } = ccn.use({ stylesheets: [stylesheet1] })

      expect(classNames("Component")).toBe('hashed-component-name')
      expect(classNames("Component__child")).toBe('hashed-child_element-name')
    })

    it('applies class names from multiple stylesheets', () => {
      const { classNames } = ccn.use({ stylesheets: [stylesheet1, stylesheet2] })

      expect(classNames("Component")).toBe('hashed-component-name another-hashed-component-name')
      expect(classNames("Component__child")).toBe('hashed-child_element-name another-hashed-child_element-name')
    })

    it('applies class names from multiple stylesheets (from multiple arguments to `use`)', () => {
      const { classNames } = ccn.use({ stylesheets: [stylesheet1] }, {stylesheets: [stylesheet2]})

      expect(classNames("Component")).toBe('hashed-component-name another-hashed-component-name')
      expect(classNames("Component__child")).toBe('hashed-child_element-name another-hashed-child_element-name')
    })

    it('only uses stylesheets from the last argument that specified an `unstyled: true` property and onwards (1)', () => {
      const { classNames } = ccn.use({ stylesheets: [stylesheet1] }, { unstyled: true, stylesheets: [stylesheet2] })

      expect(classNames("Component")).toBe('another-hashed-component-name')
      expect(classNames("Component__child")).toBe('another-hashed-child_element-name')
    })

    it('only uses stylesheets from the last argument that specified an `unstyled: true` property and onwards (2)', () => {
      const { classNames } = ccn.use({ stylesheets: [stylesheet1] }, { unstyled: true, stylesheets: [stylesheet2] }, {stylesheets: [stylesheet3]})

      expect(classNames("Component")).toBe('another-hashed-component-name a-third-hashed-component-name')
      expect(classNames("Component__child")).toBe('another-hashed-child_element-name a-third-hashed-child_element-name')
    })

    it('only uses stylesheets from the last argument that specified an `unstyled: true` property and onwards (3)', () => {
      const { classNames } = ccn.use(
        { stylesheets: [stylesheet1] },
        { unstyled: true, stylesheets: [stylesheet2] },
        { stylesheets: [stylesheet3, stylesheet4] },
        { unstyled: true }
      )

      expect(classNames("Component")).toBe('')
      expect(classNames("Component__child")).toBe('')
    })

    it('applies modifiers from stylesheets when modifiers are specified', () => {
      const { classNames } = ccn.use({
        stylesheets: [stylesheet1],
        modifiers: {
          'Component__child': ['mod']
        }
      })

      expect(classNames('Component__child')).toBe('hashed-child_element-name MODDED')
    })

    it('applies modifiers from multiple stylesheets when modifiers are specified', () => {
      const { classNames } = ccn.use({
        stylesheets: [stylesheet1, stylesheet2],
        modifiers: {
          'Component__child': ['mod']
        }
      })

      expect(classNames('Component__child')).toBe('hashed-child_element-name another-hashed-child_element-name MODDED MODDED-AGAIN')
    })

    it('only uses stylesheet modifiers from the last argument that specified an `unstyled: true` property and onwards (1)', () => {
      const { classNames } = ccn.use(
        {
          stylesheets: [stylesheet1],
        },
        {
          unstyled: true,
          stylesheets: [stylesheet2],
          modifiers: {
            'Component__child': ['mod']
          },
        }
      )

      expect(classNames('Component__child')).toBe('another-hashed-child_element-name MODDED-AGAIN')
    })

    it('only uses stylesheet modifiers from the last argument that specified an `unstyled: true` property and onwards (2)', () => {
      const { classNames } = ccn.use(
        {
          stylesheets: [stylesheet1],
        },
        {
          unstyled: true,
          stylesheets: [stylesheet2],
          modifiers: {
            'Component__child': ['mod']
          },
        },
        {
          stylesheets: [stylesheet3]
        }
      )

      expect(classNames('Component__child')).toBe('another-hashed-child_element-name a-third-hashed-child_element-name MODDED-AGAIN MODDED-THRICE')
    })

    it('dedupes class names from stylesheets', () => {
      const { classNames } = ccn.use({ stylesheets: [stylesheet1, stylesheet1] })
      expect(classNames("Component")).toBe("hashed-component-name")
    })

    it('dedupes modifiers from stylesheets', () => {
      const { classNames } = ccn.use({
        stylesheets: [stylesheet1, stylesheet1],
        modifiers: { 'Component__child': ['mod'] }
      })

      expect(classNames("Component__child")).toBe("hashed-child_element-name MODDED")
    })
    
  })
  

  describe('uses provided classNames as expected', () => {
    it('applies class names from provided classNames', () => {
      const { classNames } = ccn.use({
        classNames: {
          Container: ['text-3xl', 'font-bold', 'underline'],
          button: ['bg-sky-500', 'hover:bg-sky-700']
        }
      })

      expect(classNames("Container")).toBe('text-3xl font-bold underline')
      expect(classNames("button")).toBe('bg-sky-500 hover:bg-sky-700')
    })

    it('applies class names to the same element from multiple className properties', () => {
      const { classNames } = ccn.use(
        {
          classNames: {
            Container: ['text-3xl', 'font-bold']
          }
        },
        {
          classNames: {
            Container: ['underline']
          }
        }
      )

      expect(classNames("Container")).toBe('text-3xl font-bold underline')
    })

    it('applies class names to different elements from multiple className properties', () => {
      const { classNames } = ccn.use(
        { 
          classNames: {
            Container: ['text-3xl', 'font-bold', 'underline']
          }
        },
        {
          classNames: {
            button: ['bg-sky-500', 'hover:bg-sky-700']
          }
        }
      )

      expect(classNames("Container")).toBe('text-3xl font-bold underline')
      expect(classNames("button")).toBe('bg-sky-500 hover:bg-sky-700')
    })

    it('only applies class names from the last argument that specified `unstyled: true` and onwards (1)', () => {
      const { classNames } = ccn.use(
        {
          classNames: {
            Container: ['text-3xl', 'font-bold']
          }
        },
        {
          unstyled: true,
          classNames: {
            Container: ['underline']
          }
        }
      )

      expect(classNames("Container")).toBe('underline')
    })

    it('only applies class names from the last argument that specified `unstyled: true` and onwards (2)', () => {
      const { classNames } = ccn.use(
        {
          classNames: {
            Container: ['text-3xl', 'font-bold']
          }
        },
        {
          unstyled: true,
          classNames: {
            Container: ['underline']
          }
        },
        {
          classNames: {
            Container: ['striped']
          }
        }
      )

      expect(classNames("Container")).toBe('underline striped')
    })

    it('only applies class names from the last argument that specified `unstyled: true` and onwards (3)', () => {
      const { classNames } = ccn.use(
        {
          classNames: { Container: ['text-3xl', 'font-bold'] }
        },
        {
          unstyled: true,
          classNames: { Container: ['underline'] }
        },
        {
          classNames: { Container: ['striped'] }
        },
        {
          unstyled: true
        }
      )

      expect(classNames("Container")).toBe('')
    })

    it('applies modifiers from classNames when modifiers are specified', () => {
      const { classNames } = ccn.use({
        classNames: {
          Block: ['Block'],
          'Block--modified': ['Block--modified']
        },    
        modifiers: {
          Block: ['modified']  
        }
      })

      expect(classNames('Block')).toBe('Block Block--modified')
    })

    it('applies modifiers from multiple className properties', () => {
      const { classNames } = ccn.use(
        {
          classNames: {
            Block: ['Block'],
            'Block--modified': ['Block--modified']
          },
          modifiers: {
            Block: ['modified']
          }
        },
        {
          classNames: {
            'Block--column': ['Block--column']
          },
          modifiers: {
            Block: ['column']
          }
        }
      )

      expect(classNames('Block')).toBe('Block Block--modified Block--column')
    })

    it('only uses modifiers from the last argument that specified an `unstyled: true` property and onwards', () => {
      const { classNames } = ccn.use(
        {
          classNames: {
            Block: ['Block'],
            'Block--modified': ['Block--modified']
          },
          modifiers: {
            Block: ['modified']
          }
        },
        {
          unstyled: true,
          classNames: {
            Block: ['Block'],
            'Block--column': ['Block--column']
          },
          modifiers: {
            Block: ['column']
          }
        }
      )

      expect(classNames('Block')).toBe('Block Block--column')
    })

    it('dedupes modifiers from classNames properties', () => {
      const { classNames } = ccn.use(
        {
          classNames: {
            Block: ['Block'],
            'Block--modified': ['Block--modified']
          },
          modifiers: {
            Block: ['modified']
          }
        },
        {
          modifiers: {
            Block: ['modified', 'modified']
          }
        }
      )

      expect(classNames('Block')).toBe('Block Block--modified')
    })

    it('dedupes class names from classNames properties', () => {
      const { classNames } = ccn.use(
        { classNames: { Block: ['Block', 'Block'] } },
        { classNames: { Block: ['Block', { Block: true }] } },
        {
          classNames: {
            Block:
              ['Block',
                ['Block',
                  ['Block',
                    [{ Block: true }]
                  ]
                ]
              ]
          }
        }
      )

      expect(classNames('Block')).toBe('Block')
    })
  })
})

describe.todo('`styles` helper', () => {
  it.todo('applies inline styles for specified elementName', () => {

  })
})