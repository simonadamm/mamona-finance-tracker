import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#111111', contrastText: '#ffffff' },
    secondary: { main: '#245bff' }, success: { main: '#087f4f' },
    error: { main: '#d73543' }, info: { main: '#245bff' },
    background: { default: '#f5f5f3', paper: '#ffffff' },
    text: { primary: '#141414', secondary: '#6b6c70' }, divider: '#ececea',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    h5: { fontWeight: 650, letterSpacing: '-0.04em' },
    h6: { fontSize: '1.1rem', fontWeight: 650, letterSpacing: '-0.025em' },
    body2: { lineHeight: 1.65 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none', borderRadius: 24 }, outlined: { borderColor: '#e9e9e6' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999, minHeight: 44, padding: '10px 20px',
          transition: 'background-color 160ms, transform 160ms',
          '&:active': { transform: 'scale(0.98)' },
          '&.Mui-focusVisible': { outline: '3px solid #91abff', outlineOffset: 3 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: {
        borderRadius: 14, backgroundColor: '#fafaf9',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e2df' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a9a9a4' },
        '&.Mui-focused': { backgroundColor: '#ffffff' },
      } },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 28, boxShadow: '0 30px 100px #00000026' } } },
    MuiDialogTitle: { styleOverrides: { root: { padding: '28px 28px 12px', fontSize: '1.5rem', fontWeight: 650, letterSpacing: '-0.04em' } } },
    MuiDialogContent: { styleOverrides: { root: { padding: '16px 28px 24px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '8px 28px 28px', gap: 8 } } },
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: '#11111166', backdropFilter: 'blur(5px)' } } },
    MuiAlert: { styleOverrides: { root: {
      borderRadius: 16,
      variants: [
        { props: { severity: 'info', variant: 'standard' }, style: { backgroundColor: '#edf2ff', color: '#254d9c' } },
        { props: { severity: 'success', variant: 'standard' }, style: { backgroundColor: '#eaf7ef' } },
      ],
    } } },
    MuiTableCell: { styleOverrides: {
      root: { borderBottomColor: '#efefed', padding: '20px 24px', fontVariantNumeric: 'tabular-nums' },
      head: { backgroundColor: '#fafaf8', color: '#70716e', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' },
    } },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 }, '&.MuiTableRow-hover:hover': { backgroundColor: '#f8f9fc' } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 600, fontSize: '0.7rem', height: 26 } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 10, padding: '8px 12px' } } },
  },
})
export default theme
