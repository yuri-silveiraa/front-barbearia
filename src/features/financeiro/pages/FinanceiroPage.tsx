import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import dayjs from "dayjs";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { useAuth } from "../../../contexts/AuthContext";
import { getBarberFinanceByRange } from "../../../api/barbeiro/barbeiro.service";
import type { BarberPayment } from "../../../api/barbeiro/types";
import { FinanceChart } from "../components/FinanceChart";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function FinanceiroPage() {
  const { user } = useAuth();
  const isBarber = user?.type === "BARBER";

  const [start, setStart] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [payments, setPayments] = useState<BarberPayment[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Array<{ serviceId: string; service: string; count: number; total: number }>>([]);

  if (!isBarber) {
    return <Navigate to="/reservas" replace />;
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getBarberFinanceByRange(start, end);
      setPayments(data.payments || []);
      setBalance(data.balance || 0);
      setServices(data.services || []);
    } catch {
      setError("Erro ao carregar financeiro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPeriod = useMemo(
    () => payments.reduce((acc, item) => acc + item.amount, 0),
    [payments]
  );

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach((p) => {
      const key = dayjs(p.createdAt).format("DD/MM");
      map.set(key, (map.get(key) ?? 0) + p.amount);
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [payments]);

  return (
    <Box>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            type="date"
            label="De"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(15, 52, 96, 0.25)",
                borderRadius: 2,
              },
            }}
          />
          <TextField
            type="date"
            label="Até"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(15, 52, 96, 0.25)",
                borderRadius: 2,
              },
            }}
          />
          <Button variant="contained" onClick={loadData}>
            Filtrar
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Saldo atual
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(balance)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Total no período
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(totalPeriod)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Transações
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {payments.length}
              </Typography>
            </Paper>
          </Box>

          <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
            <FinanceChart data={chartData} />
          </Paper>

          <Stack spacing={3}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Serviços mais vendidos
              </Typography>
              {services.length === 0 ? (
                <Typography color="text.secondary">Nenhum serviço no período.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Serviço</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((item) => (
                      <TableRow key={item.serviceId}>
                        <TableCell>{item.service}</TableCell>
                        <TableCell align="right">{item.count}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Transações
              </Typography>
              {payments.length === 0 ? (
                <Typography color="text.secondary">Nenhuma transação no período.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDateTime(payment.createdAt)}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Stack>
        </>
      )}
    </Box>
  );
}
