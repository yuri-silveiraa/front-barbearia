import {
  AppBar,
  Toolbar,
  Typography,
  IconButton
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = "Barbearia Douglas" }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton color="inherit" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Typography variant="subtitle1" sx={{ mr: 2 }}>
          {user?.name}
        </Typography>

        <Typography 
          variant="body2"
          sx={{ cursor: "pointer" }}
          onClick={logout}
        >
          Sair
        </Typography>
      </Toolbar>
    </AppBar>
  );
}