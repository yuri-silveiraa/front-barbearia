import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./../features/auth/pages/LoginPage";
import { CadastroPage } from "./../features/auth/pages/CadastroPage";
import VerificarEmailPage from "../features/auth/pages/VerificarEmailPage";
import { ListaReservasPage } from "./../features/reservas/pages/ListaReservasPage";
import { PrivateRoute, IndexRedirect, RoleRoute } from "./privateRoutes";
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
import ClientesPage from "../features/clientes/pages/ClientesPage";

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
          <Route
            path="home"
            element={
              <RoleRoute allowedTypes={["CLIENT"]}>
                <HomeClientePage />
              </RoleRoute>
            }
          />
          <Route
            path="reservas"
            element={
              <RoleRoute allowedTypes={["CLIENT"]}>
                <ListaReservasPage />
              </RoleRoute>
            }
          />
          <Route
            path="reservas/create"
            element={
              <RoleRoute allowedTypes={["CLIENT"]}>
                <CriarReservaPage />
              </RoleRoute>
            }
          />
          <Route path="perfil" element={<PerfilPage />} />
          <Route
            path="agenda"
            element={
              <RoleRoute allowedTypes={["BARBER"]}>
                <AgendaBarbeiroPage />
              </RoleRoute>
            }
          />
          <Route
            path="agenda/:id"
            element={
              <RoleRoute allowedTypes={["BARBER"]}>
                <DetalhesAgendamentoPage />
              </RoleRoute>
            }
          />
          <Route
            path="agenda/periodo"
            element={
              <RoleRoute allowedTypes={["BARBER"]}>
                <AgendaBarbeiroPeriodoPage />
              </RoleRoute>
            }
          />
          <Route
            path="horarios"
            element={
              <RoleRoute allowedTypes={["BARBER"]}>
                <HorariosPage />
              </RoleRoute>
            }
          />
          <Route
            path="servicos"
            element={
              <RoleRoute allowedTypes={["BARBER"]}>
                <ServicosPage />
              </RoleRoute>
            }
          />
          <Route
            path="barbeiros"
            element={
              <RoleRoute allowedTypes={["BARBER"]} requireAdmin>
                <BarbeirosPage />
              </RoleRoute>
            }
          />
          <Route
            path="clientes"
            element={
              <RoleRoute allowedTypes={["BARBER"]} requireAdmin>
                <ClientesPage />
              </RoleRoute>
            }
          />
          <Route
            path="financeiro"
            element={
              <RoleRoute allowedTypes={["BARBER"]}>
                <FinanceiroPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
