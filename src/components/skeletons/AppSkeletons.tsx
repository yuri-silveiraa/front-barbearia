import { Box, Paper, Skeleton, Stack } from "@mui/material";

interface MetricsSkeletonProps {
  count?: number;
  columns?: {
    xs: string;
    sm?: string;
    md?: string;
  };
  minHeight?: number;
}

interface CardGridSkeletonProps {
  count?: number;
  variant?: "service" | "barber" | "plain";
}

interface ListSkeletonProps {
  rows?: number;
  withHeader?: boolean;
}

const itemIndexes = [0, 1, 2, 3, 4, 5];

export function MetricsSkeleton({
  count = 3,
  columns = { xs: "repeat(3, 1fr)" },
  minHeight = 88,
}: MetricsSkeletonProps) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: columns, gap: 1, mb: 2 }}>
      {itemIndexes.slice(0, count).map((item) => (
        <Paper
          key={item}
          elevation={0}
          sx={{
            p: { xs: 1.25, sm: 1.75 },
            minHeight,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Skeleton variant="circular" width={22} height={22} />
          <Box>
            <Skeleton width="46%" height={28} />
            <Skeleton width="72%" height={18} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export function HighlightSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "rgba(37, 208, 179, 0.28)",
        bgcolor: "rgba(0, 191, 165, 0.06)",
      }}
    >
      <Skeleton width={150} height={18} />
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton width="62%" height={34} />
          <Skeleton width="46%" height={22} />
          <Skeleton width="72%" height={20} />
        </Box>
        <Skeleton variant="circular" width={36} height={36} />
      </Box>
    </Paper>
  );
}

export function AppointmentListSkeleton({ rows = 4, withHeader = true }: ListSkeletonProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {withHeader && (
        <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1 }}>
          <Skeleton width={92} height={18} />
          <Skeleton width={170} height={26} />
        </Box>
      )}

      <Stack>
        {itemIndexes.slice(0, rows).map((item) => (
          <Box
            key={item}
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "grid",
              gridTemplateColumns: "64px minmax(0, 1fr) auto",
              gap: { xs: 1.5, sm: 2 },
              alignItems: "center",
              borderTop: item === 0 && withHeader ? 0 : "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>
              <Skeleton width={48} height={28} />
              <Skeleton width={42} height={16} />
            </Box>
            <Box>
              <Skeleton width="72%" height={24} />
              <Skeleton width="54%" height={18} />
            </Box>
            <Skeleton width={72} height={28} sx={{ borderRadius: 999 }} />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export function CardGridSkeleton({ count = 6, variant = "plain" }: CardGridSkeletonProps) {
  const isBarber = variant === "barber";
  const isService = variant === "service";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
        gap: 1.5,
      }}
    >
      {itemIndexes.slice(0, count).map((item) => (
        <Paper
          key={item}
          elevation={0}
          sx={{
            p: 2,
            minHeight: isService ? 178 : 188,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: isService ? "92px minmax(0, 1fr)" : "1fr", gap: 1.5 }}>
            {isService && <Skeleton variant="rounded" width={92} height={122} sx={{ borderRadius: "8px" }} />}
            <Box>
              {isBarber && <Skeleton variant="circular" width={52} height={52} sx={{ mb: 1.25 }} />}
              <Skeleton width="74%" height={28} />
              <Skeleton width="92%" height={18} />
              <Skeleton width="66%" height={18} />
              <Skeleton width={isService ? 88 : 118} height={26} sx={{ mt: 2 }} />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
