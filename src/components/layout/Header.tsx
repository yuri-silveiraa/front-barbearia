import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Box
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant={isMobile ? "body1" : "h6"}
            component="div"
            onClick={() => navigate(user?.type === "BARBER" ? "/agenda" : "/reservas")}
            sx={{
              cursor: "pointer",
              fontWeight: 700,
              background: "linear-gradient(45deg, #00bfa5 30%, #ffab00 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "calc(100% - 60px)", sm: "none" },
              "&:hover": {
                opacity: 0.8
              }
            }}
          >
            Douglas Barbearia
          </Typography>
        </Box>

        <UserMenu user={user} />
      </Toolbar>
    </AppBar>
  );
}
