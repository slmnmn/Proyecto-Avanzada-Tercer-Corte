import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Inicio from "./components/pages/Inicio";
import Menu from "./components/pages/Menu";
import NuevaVictima from "./components/pages/NuevaVictima";
import Detalles from "./components/pages/Detalles";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Menu" element={<Menu />} />
        {/* Rutas adicionales para futuras páginas */}
        <Route path="/NuevaVictima" element={<NuevaVictima/>} />
        <Route path="/detalles/:id" element={<Detalles/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;