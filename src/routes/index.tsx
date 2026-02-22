import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./../features/auth/pages/LoginPage";
import { CadastroPage } from "./../features/auth/pages/CadastroPage";
import { ListaReservasPage } from "./../features/reservas/pages/ListaReservasPage";
import { PrivateRoute, IndexRedirect } from "./privateRoutes";
import { MainLayout } from "./../layouts/MainLayout";
import CriarReservaPage from "../features/reservas/pages/CriarReservaPage";
import { PerfilPage } from "../features/perfil/pages/PerfilPage";
import AgendaBarbeiroPage from "../features/barbeiro/pages/AgendaBarbeiroPage";
import DetalhesAgendamentoPage from "../features/barbeiro/pages/DetalhesAgendamentoPage";
import HorariosPage from "../features/barbeiro/pages/HorariosPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<IndexRedirect />} />
          <Route path="reservas" element={<ListaReservasPage />} />
          <Route path="reservas/create" element={<CriarReservaPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="agenda" element={<AgendaBarbeiroPage />} />
          <Route path="agenda/:id" element={<DetalhesAgendamentoPage />} />
          <Route path="horarios" element={<HorariosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/reservas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
