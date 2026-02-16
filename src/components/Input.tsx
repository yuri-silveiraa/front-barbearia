import { TextField } from "@mui/material";
import { useController } from "react-hook-form";
import type { TextFieldProps } from "@mui/material";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

interface InputProps<T extends FieldValues> extends Omit<TextFieldProps, 'name' | 'error'> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
}

export function Input<T extends FieldValues>({
  name,
  control,
  label,
  ...props
}: InputProps<T>) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control
  });

  return (
    <TextField
      {...field}
      {...props}
      label={label}
      error={!!error}
      helperText={error?.message}
      fullWidth
    />
  );
}