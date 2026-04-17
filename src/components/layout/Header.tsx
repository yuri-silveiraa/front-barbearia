import {
  AppBar,
  Toolbar,
  IconButton,
  Box
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onMenuClick: () => void;
  showMenu?: boolean;
}

export function Header({ onMenuClick, showMenu = true }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: "background.paper",
        color: "text.primary",
        boxShadow: 1,
        width: "100%",
      }}
    >
      <Toolbar sx={{ 
        display: "flex",
        justifyContent: "space-between",
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1, sm: 2 },
        width: "100%",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          {showMenu && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component="img"
            src="/images/Logo-douglas-barbearia.png"
            alt="Douglas Barbearia"
            onClick={() => navigate(user?.type === "BARBER" ? "/agenda" : "/home")}
            sx={{
              cursor: "pointer",
              width: { xs: 42, sm: 48 },
              height: { xs: 42, sm: 48 },
              objectFit: "contain",
              display: "block",
              filter: "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18))",
              "&:hover": {
                opacity: 0.8
              }
            }}
          />
        </Box>

        <UserMenu user={user} />
      </Toolbar>
    </AppBar>
  );
}
