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
  TextField,
  Typography,
} from "@mui/material";
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
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState<number | string>(0);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [removerImagem, setRemoverImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");

  useEffect(() => {
    if (!open) return;

    setNome(initialData?.nome ?? "");
    setDescricao(initialData?.descrição ?? "");
    setPreco(typeof initialData?.preço === "string" ? parseFloat(initialData.preço) : (initialData?.preço ?? 0));
    setImagemArquivo(null);
    setRemoverImagem(false);
    setErroImagem("");
    setImagemPreview(initialData?.imagemUrl ?? null);
  }, [initialData, open]);

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
      imagemArquivo,
      removerImagem,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Imagem do serviço
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Envie uma foto JPG, PNG ou WEBP com até 5MB.
              </Typography>

              {imagemPreview && (
                <Box
                  sx={{
                    width: "100%",
                    height: 180,
                    borderRadius: 2,
                    mb: 2,
                    backgroundImage: `url(${imagemPreview})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              )}

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button variant="outlined" component="label">
                  {imagemPreview ? "Trocar imagem" : "Selecionar imagem"}
                  <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
                </Button>

                {imagemPreview && (
                  <Button color="inherit" onClick={handleRemoveImage}>
                    Remover imagem
                  </Button>
                )}
              </Box>

              {erroImagem && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {erroImagem}
                </Alert>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || Boolean(erroImagem)}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
