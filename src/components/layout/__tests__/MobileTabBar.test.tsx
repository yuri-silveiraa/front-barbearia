import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MobileTabBar } from "../MobileTabBar";
import type { User } from "../../../features/auth/types";

const renderWithRouter = (ui: React.ReactElement, initialPath = "/") =>
  render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);

describe("MobileTabBar", () => {
  it("renders primary admin items and opens the more drawer", () => {
    const user: User = {
      id: "1",
      name: "Admin",
      email: "admin@barberia.com",
      type: "BARBER",
      isAdmin: true
    };

    renderWithRouter(<MobileTabBar user={user} />, "/agenda");

    expect(screen.getByText("Agenda")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Mais")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Mais"));

    expect(screen.getByText("Horários")).toBeInTheDocument();
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(screen.getByText("Barbeiros")).toBeInTheDocument();
  }, 15000);
});
