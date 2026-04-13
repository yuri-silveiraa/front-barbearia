import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RoleRoute } from "../privateRoutes";
import type { User } from "../../features/auth/types";
import type { ReactElement } from "react";

let authState: {
  user: User | null;
  loadingAuth: boolean;
};

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

function renderProtectedRoute(initialPath: string, element: ReactElement) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={initialPath} element={element} />
        {initialPath !== "/home" && <Route path="/home" element={<div>Home Cliente</div>} />}
        {initialPath !== "/agenda" && <Route path="/agenda" element={<div>Agenda Barbeiro</div>} />}
      </Routes>
    </MemoryRouter>
  );
}

describe("RoleRoute", () => {
  it("redireciona cliente que tenta acessar rota de barbeiro", () => {
    authState = {
      loadingAuth: false,
      user: {
        id: "client-1",
        name: "Cliente",
        email: "cliente@barbearia.local",
        type: "CLIENT",
      },
    };

    renderProtectedRoute(
      "/horarios",
      <RoleRoute allowedTypes={["BARBER"]}>
        <div>Horários</div>
      </RoleRoute>
    );

    expect(screen.queryByText("Horários")).not.toBeInTheDocument();
    expect(screen.getByText("Home Cliente")).toBeInTheDocument();
  });

  it("redireciona barbeiro que tenta acessar rota exclusiva de cliente", () => {
    authState = {
      loadingAuth: false,
      user: {
        id: "barber-1",
        name: "Barbeiro",
        email: "barbeiro@barbearia.local",
        type: "BARBER",
      },
    };

    renderProtectedRoute(
      "/home",
      <RoleRoute allowedTypes={["CLIENT"]}>
        <div>Home Cliente</div>
      </RoleRoute>
    );

    expect(screen.queryByText("Home Cliente")).not.toBeInTheDocument();
    expect(screen.getByText("Agenda Barbeiro")).toBeInTheDocument();
  });

  it("redireciona barbeiro sem admin que tenta acessar rota administrativa", () => {
    authState = {
      loadingAuth: false,
      user: {
        id: "barber-1",
        name: "Barbeiro",
        email: "barbeiro@barbearia.local",
        type: "BARBER",
        isAdmin: false,
      },
    };

    renderProtectedRoute(
      "/barbeiros",
      <RoleRoute allowedTypes={["BARBER"]} requireAdmin>
        <div>Gerenciar Barbeiros</div>
      </RoleRoute>
    );

    expect(screen.queryByText("Gerenciar Barbeiros")).not.toBeInTheDocument();
    expect(screen.getByText("Agenda Barbeiro")).toBeInTheDocument();
  });
});
