import { Box, Typography, Tooltip } from "@mui/material";

interface FinanceChartProps {
  data: Array<{ date: string; total: number }>;
}

export function FinanceChart({ data }: FinanceChartProps) {
  const max = Math.max(0, ...data.map((item) => item.total));

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Receita por dia
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          height: 180,
          px: 1,
        }}
      >
        {data.map((item) => {
          const height = max > 0 ? Math.round((item.total / max) * 160) : 4;
          return (
            <Tooltip key={item.date} title={`${item.date} • R$ ${item.total.toFixed(2)}`}>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 12,
                  maxWidth: 24,
                  height,
                  borderRadius: 2,
                  background: "linear-gradient(180deg, #00bfa5 0%, #0f3460 100%)",
                }}
              />
            </Tooltip>
          );
        })}
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
