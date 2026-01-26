import { Alert, type AlertProps, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { type FC } from "react";

interface ErrorAlertProps extends AlertProps {
  message: string;
  onClose: () => void;
}

const ErrorAlert: FC<ErrorAlertProps> = ({ message, onClose, ...props }) => {
  return (
    <Alert
      severity="error"
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{ mb: 2 }}
      {...props}
    >
      {message}
    </Alert>
  );
};

export default ErrorAlert;