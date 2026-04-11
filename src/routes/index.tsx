import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./../features/auth/pages/LoginPage";
import { CadastroPage } from "./../features/auth/pages/CadastroPage";
import VerificarEmailPage from "../features/auth/pages/VerificarEmailPage";
import { ListaReservasPage } from "./../features/reservas/pages/ListaReservasPage";
import { PrivateRoute, IndexRedirect } from "./privateRoutes";
import { MainLayout } from "./../layouts/MainLayout";
import CriarReservaPage from "../features/reservas/pages/CriarReservaPage";
import { PerfilPage } from "../features/perfil/pages/PerfilPage";
import AgendaBarbeiroPage from "../features/barbeiro/pages/AgendaBarbeiroPage";
import DetalhesAgendamentoPage from "../features/barbeiro/pages/DetalhesAgendamentoPage";
import HorariosPage from "../features/barbeiro/pages/HorariosPage";
import ServicosPage from "../features/servicos/pages/ServicosPage";
import AgendaBarbeiroPeriodoPage from "../features/barbeiro/pages/AgendaBarbeiroPeriodoPage";
import BarbeirosPage from "../features/barbeiros/pages/BarbeirosPage";
import FinanceiroPage from "../features/financeiro/pages/FinanceiroPage";
import HomeClientePage from "../features/home/pages/HomeClientePage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/verificar-email" element={<VerificarEmailPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<IndexRedirect />} />
          <Route path="home" element={<HomeClientePage />} />
          <Route path="reservas" element={<ListaReservasPage />} />
          <Route path="reservas/create" element={<CriarReservaPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="agenda" element={<AgendaBarbeiroPage />} />
          <Route path="agenda/:id" element={<DetalhesAgendamentoPage />} />
          <Route path="agenda/periodo" element={<AgendaBarbeiroPeriodoPage />} />
          <Route path="horarios" element={<HorariosPage />} />
          <Route path="servicos" element={<ServicosPage />} />
          <Route path="barbeiros" element={<BarbeirosPage />} />
          <Route path="financeiro" element={<FinanceiroPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
