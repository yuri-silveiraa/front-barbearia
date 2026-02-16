import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  children: React.ReactNode;
  loading?: boolean;
}

export function CustomButton({ 
  children, 
  loading = false, 
  disabled,
  ...props 
}: CustomButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
    >
      {loading ? 'Carregando...' : children}
    </Button>
  );
}

export { Button } from "@mui/material";