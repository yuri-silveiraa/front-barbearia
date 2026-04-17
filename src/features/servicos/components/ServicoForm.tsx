import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageIcon from "@mui/icons-material/Image";
import type { Service, CreateServiceData } from "../types";

interface ServicoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateServiceData) => Promise<void>;
  initialData?: Service | null;
  loading?: boolean;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function ServicoForm({
  open,
  onClose,
  onSave,
  initialData,
  loading = false,
}: ServicoFormProps) {
  if (!open) return null;

  return (
    <ServicoFormDialog
      key={initialData?.id ?? "new-service"}
      open={open}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
      loading={loading}
    />
  );
}

function ServicoFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  loading = false,
}: ServicoFormProps) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [descricao, setDescricao] = useState(initialData?.descrição ?? "");
  const [preco, setPreco] = useState<number | string>(
    typeof initialData?.preço === "string" ? parseFloat(initialData.preço) : (initialData?.preço ?? 0)
  );
  const [duration, setDuration] = useState<number | string>(initialData?.duration ?? initialData?.durationMinutes ?? 30);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(initialData?.imagemUrl ?? null);
  const [removerImagem, setRemoverImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");

  useEffect(() => {
    return () => {
      if (imagemPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErroImagem("Use uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErroImagem("A imagem deve ter no máximo 5MB.");
      event.target.value = "";
      return;
    }

    setErroImagem("");
    setImagemArquivo(file);
    setRemoverImagem(false);
    setImagemPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImagemArquivo(null);
    setImagemPreview(null);
    setErroImagem("");
    setRemoverImagem(Boolean(initialData?.imagemUrl));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await onSave({
      nome,
      descrição: descricao || undefined,
      preço: Number(preco),
      duration: Number(duration),
      imagemArquivo,
      removerImagem,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "8px", m: { xs: 1.5, sm: 3 } } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Serviço
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {initialData ? "Editar serviço" : "Novo serviço"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Preço (R$)"
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Duração (min)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              fullWidth
              required
              inputProps={{ min: 15, max: 480, step: 5 }}
            />

            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
              }}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.25, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "action.hover",
                    color: "primary.main",
                  }}
                >
                  <ImageIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Imagem do serviço
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    JPG, PNG ou WEBP com até 5MB.
                  </Typography>
                </Box>
              </Box>

              {imagemPreview && (
                <Box
                  sx={{
                    width: "100%",
                    minHeight: 260,
                    maxHeight: 360,
                    borderRadius: "8px",
                    mb: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={imagemPreview}
                    alt={nome || "Imagem do serviço"}
                    sx={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 360,
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" component="label" fullWidth>
                  {imagemPreview ? "Trocar imagem" : "Selecionar imagem"}
                  <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
                </Button>

                {imagemPreview && (
                  <Button color="inherit" onClick={handleRemoveImage} startIcon={<DeleteOutlineIcon />} fullWidth>
                    Remover imagem
                  </Button>
                )}
              </Stack>

              {erroImagem && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {erroImagem}
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || Boolean(erroImagem)} fullWidth>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
