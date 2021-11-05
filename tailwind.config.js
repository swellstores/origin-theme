module.exports = {
  mode: 'jit',
  purge: {
    content: ['./tailwind-safelist.txt'],
  },
  theme: {
    colors: {
      outline: 'hsla(200, 100%, 36%, 0.75)',
      primary: {
        darkest: 'var(--colors-primary-darkest)',
        darker: 'var(--colors-primary-darker)',
        dark: 'var(--colors-primary-dark)',
        med: 'var(--colors-primary-med)',
        light: 'var(--colors-primary-light)',
        lighter: 'var(--colors-primary-lighter)',
        lightest: 'var(--colors-primary-lightest)',
      },
      accent: {
        default: 'var(--colors-accent)',
      },
      ok: {
        default: 'var(--colors-status-ok)',
        faded: 'var(--colors-status-ok-faded)',
      },
      warning: {
        default: 'var(--colors-status-warn)',
      },
      error: {
        default: 'var(--colors-status-error)',
        faded: 'var(--colors-status-error-faded)',
      },
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      body: 'var(--typography-body-font-normal)',
      heading: 'var(--typography-heading-font)',
    },
    fontSize: {
      '2xs': 'var(--type-scale--3)',
      xs: 'var(--type-scale--2)',
      sm: 'var(--type-scale--1)',
      base: 'var(--type-scale-0)',
      lg: 'var(--type-scale-1)',
      xl: 'var(--type-scale-2)',
      '2xl': 'var(--type-scale-3)',
      '3xl': 'var(--type-scale-4)',
      '4xl': 'var(--type-scale-5)',
      '5xl': 'var(--type-scale-6)',
      '6xl': 'var(--type-scale-7)',
      '7xl': 'var(--type-scale-8)',
      '8xl': 'var(--type-scale-9)',
    },
    spacing: {
      px: '1px',
      '2px': '2px',
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      18: '4.5rem',
      20: '5rem',
      22: '5.5rem',
      24: '6rem',
      26: '6.5rem',
      28: '7rem',
      32: '8rem',
      34: '8.5rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
      112: '28rem',
      120: '30rem',
      128: '32rem',
      160: '40rem',
      256: '64rem',
      '1/2': '50%',
      '1/3': '33.33333%',
      '2/3': '66.66667%',
      '1/4': '25%',
      '3/4': '75%',
      '1/5': '20%',
      '2/5': '40%',
      '3/5': '60%',
      '4/5': '80%',
      '9/10': '90%',
      '25vh': '25vh',
      '80vh': '80vh',
      full: '100%',
      '100vh': '100vh',
      '6/5': '120%',
      min: 'min-content',
      max: 'max-content',
    },
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
    },
    zIndex: {
      auto: 'auto',
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
      '-1': '-1',
      '-5': '-5',
    },
    minWidth: (theme) => ({
      ...theme('spacing'),
    }),
    maxWidth: (theme) => ({
      ...theme('spacing'),
    }),
    minHeight: (theme) => ({
      ...theme('spacing'),
    }),
    maxHeight: (theme) => ({
      ...theme('spacing'),
    }),
    borderColor: (theme) => ({
      ...theme('colors'),
      default: theme('colors.primary.med', 'currentColor'),
    }),
    inset: (theme) => ({
      auto: 'auto',
      ...theme('spacing'),
    }),
    rotate: {
      90: '90deg',
      180: '180deg',
    },
    extend: {
      boxShadow: (theme) => ({
        md: '0 2px 8px 0 rgba(0,0,0,0.08)',
        outline: `0 0 0 3px ${theme('colors.outline')}`,
      }),
      gridTemplateColumns: {
        '2-max': 'max-content 1fr',
      },
    },
  },
  variants: {
    borderWidth: ['responsive', 'first', 'last', 'odd', 'even'],
    margin: ['responsive', 'first', 'last'],
    opacity: ['responsive', 'hover', 'focus', 'group-hover'],
    translate: ['responsive', 'hover', 'focus', 'group-hover'],
  },
  plugins: [
    function ({ addUtilities, config, e }) {
      const rotateUtilities = Object.entries(config('theme.rotate')).map(
        ([key, value]) => {
          return {
            [`.${e(`rotate-${key}`)}`]: {
              transform: `rotate(${value})`,
            },
          }
        }
      )

      addUtilities(rotateUtilities, ['hover'])
    },
  ],
}
