import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./../features/auth/pages/LoginPage";
import { ListaReservasPage } from "./../features/reservas/pages/ListaReservasPage";
import { PrivateRoute } from "./privateRoutes";
import { MainLayout } from "./../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="reservas" element={<ListaReservasPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
