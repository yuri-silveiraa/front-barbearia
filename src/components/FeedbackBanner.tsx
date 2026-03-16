import { Alert, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type FeedbackSeverity = "success" | "error" | "warning" | "info";

interface FeedbackBannerProps {
  message?: string | null;
  severity?: FeedbackSeverity;
  onClose?: () => void;
  maxWidth?: number;
}

export function FeedbackBanner({
  message,
  severity = "error",
  onClose,
  maxWidth = 680
}: FeedbackBannerProps) {
  if (!message) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth,
        zIndex: (theme) => theme.zIndex.modal + 1
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : undefined
        }
        sx={{
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        {message}
      </Alert>
    </Box>
  );
}
