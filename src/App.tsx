import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PizzaBuilder from './components/PizzaBuilder'
import HomePage from './components/HomePage'
import { AuthProvider } from './contexts/AuthContext'

const theme = createTheme({
  palette: {
    primary: {
      main: '#e65100',
    },
    secondary: {
      main: '#f57c00',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        },
        '#root': {
          minHeight: '100vh',
          width: '100vw',
          overflowX: 'hidden',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/builder" element={<PizzaBuilder />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
