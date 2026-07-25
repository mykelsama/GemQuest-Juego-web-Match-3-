/** Punto de entrada de la aplicacion React. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "./styles/global.css";
import App from './App.tsx'

/** Monta el componente raiz dentro del elemento root del HTML. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
