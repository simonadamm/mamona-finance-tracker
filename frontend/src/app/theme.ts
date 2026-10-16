import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { variant: 'contained', color: 'primary' },
              style: {
                '&:not(.Mui-disabled)': {
                  backgroundColor: '#171717',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#333333',
                  },
                },
              },
            },
          ],
        },
      },
    },
  },
})

export default theme
