import { BottomNavigation, BottomNavigationAction, Paper, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import GroupIcon from "@mui/icons-material/Group";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "../../features/auth/types";

interface MobileTabBarProps {
  user?: User | null;
}

const clientItems = [
  { label: "Reservas", path: "/reservas", icon: <CalendarMonthIcon /> },
  { label: "Perfil", path: "/perfil", icon: <PersonIcon /> },
];

const barberItems = [
  { label: "Agenda", path: "/agenda", icon: <CalendarMonthIcon /> },
  { label: "Agendamentos", path: "/agenda/periodo", icon: <CalendarMonthIcon /> },
  { label: "Horários", path: "/horarios", icon: <ScheduleIcon /> },
  { label: "Perfil", path: "/perfil", icon: <PersonIcon /> },
];

const adminItems = [
  { label: "Agenda", path: "/agenda", icon: <CalendarMonthIcon /> },
  { label: "Agendamentos", path: "/agenda/periodo", icon: <CalendarMonthIcon /> },
  { label: "Horários", path: "/horarios", icon: <ScheduleIcon /> },
  { label: "Serviços", path: "/servicos", icon: <ContentCutIcon /> },
  { label: "Barbeiros", path: "/barbeiros", icon: <GroupIcon /> },
  { label: "Perfil", path: "/perfil", icon: <PersonIcon /> },
];

export function MobileTabBar({ user }: MobileTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.type === "BARBER" && user?.isAdmin === true;
  const items = isAdmin ? adminItems : user?.type === "BARBER" ? barberItems : clientItems;

  const currentIndex = items.findIndex((item) => location.pathname === item.path);
  const value = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <BottomNavigation
        showLabels={false}
        value={value}
        onChange={(_, newValue) => {
          const target = items[newValue];
          if (target) navigate(target.path);
        }}
        sx={{
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            paddingX: 1.5,
          },
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            color: "primary.main",
          },
        }}
      >
        {items.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="top">
            <BottomNavigationAction
              aria-label={item.label}
              icon={item.icon}
            />
          </Tooltip>
        ))}
      </BottomNavigation>
    </Paper>
  );
}
