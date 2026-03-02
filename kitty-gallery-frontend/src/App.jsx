import { Routes, Route } from "react-router-dom";
import Home3D from "./pages/Home3D";
import Gallery from "./pages/Gallery";
import Admin from "./pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home3D />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/gestion-secreta-hk-2026" element={<Admin />} />
    </Routes>
  );
}

export default App;
