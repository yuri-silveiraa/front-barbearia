import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userType?: "BARBER" | "CLIENT";
}

const clientMenuItems = [
  {
    label: "Reservas",
    icon: <CalendarMonthIcon />,
    path: "/reservas"
  },
  {
    label: "Minha Conta",
    icon: <PersonIcon />,
    path: "/perfil"
  }
];

const barberMenuItems = [
  {
    label: "Agenda do Dia",
    icon: <CalendarMonthIcon />,
    path: "/agenda"
  },
  {
    label: "Minha Conta",
    icon: <PersonIcon />,
    path: "/perfil"
  },
  {
    label: "Horários",
    icon: <ScheduleIcon />,
    path: "/horarios"
  }
];

export function Sidebar({ open, onClose, userType }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = userType === "BARBER" ? barberMenuItems : clientMenuItems;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          borderRight: "none",
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          color: "white"
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #00bfa5 30%, #ffab00 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Douglas Barbearia
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 1.5,
              backgroundColor: isActive(item.path)
                ? "rgba(0, 191, 165, 0.15)"
                : "transparent",
              "&:hover": {
                backgroundColor: isActive(item.path)
                  ? "rgba(0, 191, 165, 0.25)"
                  : "rgba(255,255,255,0.05)"
              },
              transition: "all 0.2s ease"
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive(item.path) ? "primary.main" : "rgba(255,255,255,0.7)",
                minWidth: 40
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: isActive(item.path) ? 600 : 400,
                color: isActive(item.path) ? "primary.main" : "rgba(255,255,255,0.9)"
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.4)", textAlign: "center", display: "block" }}
        >
          © 2024 Douglas Barbearia
        </Typography>
      </Box>
    </Drawer>
  );
}
