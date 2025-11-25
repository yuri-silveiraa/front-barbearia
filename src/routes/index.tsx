import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ListaReservasPage } from "../features/reservas/pages/ListaReservasPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/reservas" element={<ListaReservasPage />} />
      </Routes>
    </BrowserRouter>
  );
}
