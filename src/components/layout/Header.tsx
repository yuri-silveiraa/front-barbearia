import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography
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
        <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
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
            component="button"
            onClick={() => navigate(user?.type === "BARBER" ? "/agenda" : "/home")}
            sx={{
              border: 0,
              p: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.75, sm: 1 },
              minWidth: 0,
              "&:hover": {
                opacity: 0.8
              }
            }}
          >
            <Box
              component="img"
              src="/images/Logo-douglas-barbearia.png"
              alt="Douglas Barbearia"
              sx={{
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18))",
                flexShrink: 0,
              }}
            />
            <Typography
              component="span"
              sx={{
                display: { xs: "none", sm: "block" },
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "text.primary",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              Douglas Barbearia
            </Typography>
          </Box>
        </Box>

        <UserMenu user={user} />
      </Toolbar>
    </AppBar>
  );
}
