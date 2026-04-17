import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Navigate } from "react-router-dom";
import { blockCustomer, getAdminCustomers, unblockCustomer } from "../../../api/clientes/clientes.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { CardGridSkeleton, MetricsSkeleton } from "../../../components/skeletons/AppSkeletons";
import { useAuth } from "../../../contexts/AuthContext";
import type { AdminCustomer } from "../types";

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ClientesPage() {
  const { user } = useAuth();
  const isAdmin = user?.type === "BARBER" && user.isAdmin;

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [action, setAction] = useState<"block" | "unblock" | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setCustomers(await getAdminCustomers());
    } catch {
      setError("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadCustomers();
  }, [isAdmin, loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.whatsapp, customer.email ?? ""]
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [customers, query]);

  const blockedCount = customers.filter((customer) => customer.blockedAt).length;
  const noShowCount = customers.reduce((sum, customer) => sum + customer.noShowCount, 0);

  if (!isAdmin) {
    return <Navigate to="/agenda" replace />;
  }

  const openAction = (customer: AdminCustomer, nextAction: "block" | "unblock") => {
    setSelectedCustomer(customer);
    setAction(nextAction);
    setBlockReason(customer.blockedReason ?? "");
  };

  const closeAction = () => {
    if (saving) return;
    setSelectedCustomer(null);
    setAction(null);
    setBlockReason("");
  };

  const confirmAction = async () => {
    if (!selectedCustomer || !action) return;
    try {
      setSaving(true);
      if (action === "block") {
        await blockCustomer(selectedCustomer.id, blockReason);
        setSuccess("Cliente bloqueado com sucesso");
      } else {
        await unblockCustomer(selectedCustomer.id);
        setSuccess("Cliente desbloqueado com sucesso");
      }
      closeAction();
      loadCustomers();
    } catch {
      setError(action === "block" ? "Erro ao bloquear cliente" : "Erro ao desbloquear cliente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1040, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Administração
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: 28, sm: 34 }, fontWeight: 800, lineHeight: 1.05, mb: 1 }}
        >
          Clientes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhe faltas e bloqueie manualmente quem está prejudicando a agenda.
        </Typography>
      </Box>

      {loading ? (
        <MetricsSkeleton columns={{ xs: "1fr 1fr", sm: "repeat(3, 1fr)" }} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1, mb: 2 }}>
          {[
            { label: "Clientes", value: String(customers.length), icon: <GroupsIcon fontSize="small" /> },
            { label: "Bloqueados", value: String(blockedCount), icon: <BlockIcon fontSize="small" /> },
            { label: "Faltas", value: String(noShowCount), icon: <WarningAmberIcon fontSize="small" /> },
          ].map((item) => (
            <Paper
              key={item.label}
              elevation={0}
              sx={{
                p: { xs: 1.25, sm: 1.75 },
                minHeight: 88,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ color: "text.secondary", display: "flex" }}>{item.icon}</Box>
              <Box>
                <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nome, WhatsApp ou email"
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      {loading ? (
        <CardGridSkeleton />
      ) : filteredCustomers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: { xs: 4, sm: 6 }, textAlign: "center", borderRadius: "8px", border: "1px dashed", borderColor: "divider" }}
        >
          <PersonSearchIcon sx={{ color: "text.disabled", fontSize: 40, mb: 1 }} />
          <Typography fontWeight={800}>Nenhum cliente encontrado</Typography>
          <Typography variant="body2" color="text.secondary">
            Ajuste a busca ou aguarde novos agendamentos.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {filteredCustomers.map((customer) => {
            const blocked = Boolean(customer.blockedAt);
            return (
              <Paper
                key={customer.id}
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  border: "1px solid",
                  borderColor: blocked ? "error.main" : "divider",
                  borderRadius: "8px",
                  bgcolor: "background.paper",
                }}
              >
                <Stack spacing={1.25}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={900} noWrap>
                        {customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatWhatsapp(customer.whatsapp)}
                      </Typography>
                      {customer.email && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {customer.email}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      color={blocked ? "error" : "success"}
                      label={blocked ? "Bloqueado" : "Ativo"}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip size="small" variant="outlined" label={`${customer.totalAppointments} agendamentos`} />
                    <Chip size="small" variant="outlined" color={customer.noShowCount > 0 ? "warning" : "default"} label={`${customer.noShowCount} faltas`} />
                  </Box>

                  {blocked && customer.blockedReason && (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      {customer.blockedReason}
                    </Alert>
                  )}

                  <Button
                    variant={blocked ? "outlined" : "contained"}
                    color={blocked ? "success" : "error"}
                    startIcon={blocked ? <CheckCircleIcon /> : <BlockIcon />}
                    onClick={() => openAction(customer, blocked ? "unblock" : "block")}
                    fullWidth
                    sx={{ minHeight: 42, borderRadius: "8px" }}
                  >
                    {blocked ? "Desbloquear cliente" : "Bloquear cliente"}
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={Boolean(selectedCustomer && action)} onClose={closeAction} fullWidth maxWidth="xs">
        <DialogTitle>{action === "block" ? "Bloquear cliente" : "Desbloquear cliente"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedCustomer?.name}
          </Typography>
          {action === "block" && (
            <TextField
              label="Motivo do bloqueio"
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, display: "block" }}>
          <Button onClick={closeAction} disabled={saving} fullWidth sx={{ mb: 1 }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmAction}
            disabled={saving}
            variant="contained"
            color={action === "block" ? "error" : "success"}
            fullWidth
          >
            {saving ? "Salvando..." : action === "block" ? "Bloquear" : "Desbloquear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
