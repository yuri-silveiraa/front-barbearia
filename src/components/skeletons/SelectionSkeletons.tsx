import { Box, Paper, Skeleton } from "@mui/material";

const itemIndexes = [0, 1, 2, 3, 4, 5];

export function SelectionListSkeleton({ rows = 3, avatar = false }: { rows?: number; avatar?: boolean }) {
  return (
    <Box>
      <Skeleton width={190} height={28} />
      <Skeleton width="78%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: "grid", gap: 1.25 }}>
        {itemIndexes.slice(0, rows).map((item) => (
          <Paper
            key={item}
            elevation={0}
            sx={{
              p: 1.5,
              minHeight: 76,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "grid",
              gridTemplateColumns: avatar ? "44px minmax(0, 1fr) auto" : "minmax(0, 1fr) auto",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            {avatar && <Skeleton variant="circular" width={44} height={44} />}
            <Box>
              <Skeleton width="72%" height={24} />
              <Skeleton width="48%" height={18} />
            </Box>
            <Skeleton width={avatar ? 24 : 86} height={24} />
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export function TimePickerSkeleton() {
  return (
    <Box>
      <Skeleton width={210} height={28} />
      <Skeleton width="82%" height={20} sx={{ mb: 2 }} />
      <Skeleton width={130} height={18} sx={{ mb: 1 }} />
      <Box sx={{ display: "flex", gap: 1, overflow: "hidden", pb: 1 }}>
        {itemIndexes.slice(0, 4).map((item) => (
          <Skeleton key={item} variant="rounded" width={92} height={78} sx={{ borderRadius: "8px", flexShrink: 0 }} />
        ))}
      </Box>
      <Skeleton width={82} height={18} sx={{ mt: 1.5, mb: 1 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1 }}>
        {itemIndexes.slice(0, 6).map((item) => (
          <Skeleton key={item} variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
        ))}
      </Box>
    </Box>
  );
}
