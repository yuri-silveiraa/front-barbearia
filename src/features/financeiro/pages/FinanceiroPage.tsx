import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PaidIcon from "@mui/icons-material/Paid";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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

function formatDate(value: string) {
  return dayjs(value).format("DD/MM");
}

export default function FinanceiroPage() {
  const { user } = useAuth();
  const isBarber = user?.type === "BARBER";

  const [start, setStart] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [appliedRange, setAppliedRange] = useState({
    start: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    end: dayjs().format("YYYY-MM-DD"),
  });
  const [payments, setPayments] = useState<BarberPayment[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Array<{ serviceId: string; service: string; count: number; total: number }>>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBarberFinanceByRange(appliedRange.start, appliedRange.end);
      setPayments(data.payments || []);
      setBalance(data.balance || 0);
      setServices(data.services || []);
    } catch {
      setError("Erro ao carregar financeiro");
    } finally {
      setLoading(false);
    }
  }, [appliedRange.end, appliedRange.start]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilter = () => {
    setAppliedRange({ start, end });
  };

  const totalPeriod = useMemo(
    () => payments.reduce((acc, item) => acc + item.amount, 0),
    [payments]
  );

  const averageTicket = useMemo(
    () => payments.length > 0 ? totalPeriod / payments.length : 0,
    [payments.length, totalPeriod]
  );

  const bestService = useMemo(
    () => [...services].sort((a, b) => b.total - a.total)[0],
    [services]
  );

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach((p) => {
      const key = formatDate(p.createdAt);
      map.set(key, (map.get(key) ?? 0) + p.amount);
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [payments]);

  const periodLabel = `${formatDate(appliedRange.start)} - ${formatDate(appliedRange.end)}`;
  const orderedPayments = useMemo(
    () => [...payments].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
    [payments]
  );

  if (!isBarber) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1040, mx: "auto" }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Financeiro
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: 28, sm: 34 },
            fontWeight: 800,
            lineHeight: 1.05,
            mb: 1,
          }}
        >
          Faturamento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhe pagamentos, serviços vendidos e receita do período.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
          <TextField
            type="date"
            label="De"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
          <TextField
            type="date"
            label="Até"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleApplyFilter}
            disabled={loading}
            sx={{
              minHeight: 40,
              px: 3,
              flexShrink: 0,
              borderRadius: 2,
            }}
          >
            Filtrar
          </Button>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "1.3fr repeat(3, 1fr)" },
              gap: 1.25,
              mb: 2,
            }}
          >
            {[
              {
                label: "Saldo atual",
                value: formatCurrency(balance),
                helper: "Disponível para o barbeiro",
                icon: <PaidIcon />,
                featured: true,
              },
              {
                label: "Receita",
                value: formatCurrency(totalPeriod),
                helper: periodLabel,
                icon: <TrendingUpIcon />,
              },
              {
                label: "Transações",
                value: String(payments.length),
                helper: "Pagamentos recebidos",
                icon: <ReceiptLongIcon />,
              },
              {
                label: "Ticket médio",
                value: formatCurrency(averageTicket),
                helper: "Por pagamento",
                icon: <ContentCutIcon />,
              },
            ].map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: 2,
                  minHeight: 128,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: item.featured ? "rgba(37, 208, 179, 0.45)" : "divider",
                  bgcolor: item.featured ? "rgba(0, 191, 165, 0.08)" : "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {item.label}
                  </Typography>
                  <Box sx={{ color: item.featured ? "primary.main" : "text.secondary", display: "flex" }}>
                    {item.icon}
                  </Box>
                </Box>
                <Box>
                  <Typography variant={item.featured ? "h5" : "h6"} fontWeight={800} sx={{ mb: 0.5 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.helper}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              mb: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <FinanceChart data={chartData} formatCurrency={formatCurrency} />
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                    Serviços
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Mais vendidos
                  </Typography>
                </Box>
                {bestService && <Chip label={bestService.service} size="small" color="primary" variant="outlined" />}
              </Box>

              {services.length === 0 ? (
                <Typography color="text.secondary">Nenhum serviço no período.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {[...services]
                    .sort((a, b) => b.total - a.total)
                    .map((item) => {
                      const share = totalPeriod > 0 ? Math.round((item.total / totalPeriod) * 100) : 0;
                      return (
                        <Box key={item.serviceId}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={700} noWrap>
                                {item.service}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.count} {item.count === 1 ? "venda" : "vendas"}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                              <Typography fontWeight={800}>{formatCurrency(item.total)}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {share}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ height: 6, bgcolor: "action.hover", borderRadius: 2, overflow: "hidden" }}>
                            <Box
                              sx={{
                                width: `${share}%`,
                                height: "100%",
                                bgcolor: "primary.main",
                                borderRadius: 2,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                </Stack>
              )}
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                    Histórico
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Transações
                  </Typography>
                </Box>
                <Chip label={periodLabel} size="small" variant="outlined" />
              </Box>

              {orderedPayments.length === 0 ? (
                <Typography color="text.secondary">Nenhuma transação no período.</Typography>
              ) : (
                <Stack divider={<Divider flexItem />} spacing={1.25}>
                  {orderedPayments.map((payment) => (
                    <Box
                      key={payment.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700}>Pagamento recebido</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(payment.createdAt)}
                        </Typography>
                      </Box>
                      <Typography fontWeight={800} color="primary.main" sx={{ flexShrink: 0 }}>
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}
