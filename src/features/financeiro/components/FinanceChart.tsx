import { Box, Tooltip, Typography } from "@mui/material";

interface FinanceChartProps {
  data: Array<{ date: string; total: number }>;
  formatCurrency: (value: number) => string;
}

export function FinanceChart({ data, formatCurrency }: FinanceChartProps) {
  const max = Math.max(0, ...data.map((item) => item.total));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Evolução
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            Receita por dia
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
          {data.length} dias
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 0.75,
          height: { xs: 160, sm: 190 },
          overflowX: "auto",
          pb: 0.5,
          scrollbarWidth: "thin",
        }}
      >
        {data.length === 0 ? (
          <Box
            sx={{
              width: "100%",
              minHeight: 120,
              display: "grid",
              placeItems: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">Sem receita no período.</Typography>
          </Box>
        ) : (
          data.map((item) => {
            const height = max > 0 ? Math.max(8, Math.round((item.total / max) * 150)) : 8;
            return (
              <Tooltip key={item.date} title={`${item.date} - ${formatCurrency(item.total)}`}>
                <Box
                  sx={{
                    flex: "1 0 18px",
                    maxWidth: 30,
                    minWidth: 14,
                    height,
                    borderRadius: "8px 8px 3px 3px",
                    background: "linear-gradient(180deg, #25d0b3 0%, #078a78 100%)",
                    boxShadow: "0 8px 18px rgba(0, 191, 165, 0.16)",
                  }}
                />
              </Tooltip>
            );
          })
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, px: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {data[0]?.date || "--"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {data[data.length - 1]?.date || "--"}
        </Typography>
      </Box>
    </Box>
  );
}
