import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CriarReservaPage from "../CriarReservaPage";
import {
  criarReserva,
  getBarbers,
  getServices,
  getTimesByBarber,
} from "../../../../api/reservas/reserva.service";
import type { Barber, Service, TimeSlot } from "../../../../api/reservas/types";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "client-1",
      name: "Cliente",
      email: "cliente@barbearia.local",
      type: "CLIENT",
    },
  }),
}));

vi.mock("../../../../api/reservas/reserva.service", () => ({
  criarReserva: vi.fn(),
  getBarbers: vi.fn(),
  getServices: vi.fn(),
  getTimesByBarber: vi.fn(),
}));

vi.mock("../../components/SelectBarber", () => ({
  default: ({
    barbers,
    value,
    onChange,
    error,
  }: {
    barbers: Barber[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => (
    <div>
      <div data-testid="selected-barber">{value}</div>
      {barbers.map((barber) => (
        <button key={barber.id} type="button" onClick={() => onChange(barber.id)}>
          {barber.name}
        </button>
      ))}
      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock("../../components/SelectService", () => ({
  default: ({
    services,
    value,
    onChange,
    error,
  }: {
    services: Service[];
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
  }) => (
    <div>
      <div data-testid="selected-services">{value.join(",")}</div>
      {services.map((service) => (
        <button key={service.id} type="button" onClick={() => onChange([...value, service.id])}>
          {service.name}
        </button>
      ))}
      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock("../../components/SelectCalendarTimePicker", () => ({
  default: ({
    times,
    value,
    onChange,
    error,
  }: {
    times: TimeSlot[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => (
    <div>
      <div data-testid="selected-time">{value}</div>
      {times.map((time) => (
        <button key={time.id} type="button" onClick={() => onChange(time.id)}>
          {time.startAt}
        </button>
      ))}
      {error && <span>{error}</span>}
    </div>
  ),
}));

const barbers: Barber[] = [
  { id: "barber-1", name: "Douglas", email: "douglas@barbearia.local" },
  { id: "barber-2", name: "Carlos", email: "carlos@barbearia.local" },
];

const servicesByBarber: Record<string, Service[]> = {
  "barber-1": [
    {
      id: "service-1",
      barberId: "barber-1",
      name: "Corte Tradicional",
      price: 50,
      duration: 30,
    },
    {
      id: "service-2",
      barberId: "barber-1",
      name: "Barba Completa",
      price: 40,
      duration: 45,
    },
  ],
  "barber-2": [
    {
      id: "service-3",
      barberId: "barber-2",
      name: "Corte Degradê",
      price: 60,
      duration: 45,
    },
  ],
};

const slots: TimeSlot[] = [
  {
    id: "slot-1",
    data: "2026-04-18T12:00:00.000Z",
    date: "2026-04-18T12:00:00.000Z",
    startAt: "2026-04-18T12:00:00.000Z",
    endAt: "2026-04-18T12:30:00.000Z",
  },
];

function setupMocks() {
  vi.mocked(getBarbers).mockResolvedValue(barbers);
  vi.mocked(getServices).mockImplementation(async (barberId) => servicesByBarber[barberId ?? "barber-1"] ?? []);
  vi.mocked(getTimesByBarber).mockResolvedValue(slots);
  vi.mocked(criarReserva).mockResolvedValue({ id: "appointment-1" } as never);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <CriarReservaPage />
    </MemoryRouter>
  );
}

describe("CriarReservaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("mantém o serviço no resumo e envia serviceIds ao criar a reserva", async () => {
    renderPage();

    expect(screen.getAllByText("Escolha o barbeiro").length).toBeGreaterThan(0);

    fireEvent.click(await screen.findByRole("button", { name: "Douglas" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getAllByText("Escolha os serviços").length).toBeGreaterThan(0);

    fireEvent.click(await screen.findByRole("button", { name: "Corte Tradicional" }));
    expect(screen.getAllByText("Corte Tradicional").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(getTimesByBarber).toHaveBeenCalledWith("barber-1", ["service-1"]);
    });

    expect(screen.getByText("Corte Tradicional")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: "2026-04-18T12:00:00.000Z" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(criarReserva).toHaveBeenCalledWith({
        barberId: "barber-1",
        clientId: "client-1",
        serviceIds: ["service-1"],
        startAt: "2026-04-18T12:00:00.000Z",
      });
    });
  });

  it("limpa serviço e horário quando troca o barbeiro antes de avançar", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Douglas" }));
    fireEvent.click(screen.getByRole("button", { name: "Carlos" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByRole("button", { name: "Corte Degradê" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Corte Tradicional" })).not.toBeInTheDocument();
  });

  it("limpa o horário selecionado quando troca os serviços", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Douglas" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    fireEvent.click(await screen.findByRole("button", { name: "Corte Tradicional" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(await screen.findByRole("button", { name: "2026-04-18T12:00:00.000Z" }));

    expect(screen.getByTestId("selected-time")).toHaveTextContent("slot-1");

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    fireEvent.click(screen.getByRole("button", { name: "Barba Completa" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByTestId("selected-time")).toHaveTextContent("");
    await waitFor(() => {
      expect(getTimesByBarber).toHaveBeenLastCalledWith("barber-1", ["service-1", "service-2"]);
    });
  });
});
