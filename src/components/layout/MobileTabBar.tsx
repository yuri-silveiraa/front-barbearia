import { useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import GroupIcon from "@mui/icons-material/Group";
import PaidIcon from "@mui/icons-material/Paid";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
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
  { label: "Financeiro", path: "/financeiro", icon: <PaidIcon /> },
  { label: "Perfil", path: "/perfil", icon: <PersonIcon /> },
];

export function MobileTabBar({ user }: MobileTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isAdmin = user?.type === "BARBER" && user?.isAdmin === true;
  const isBarber = user?.type === "BARBER";
  const primaryItems = isAdmin
    ? [
        { label: "Agenda", path: "/agenda", icon: <CalendarMonthIcon /> },
        { label: "Agendamentos", path: "/agenda/periodo", icon: <CalendarMonthIcon /> },
        { label: "Financeiro", path: "/financeiro", icon: <PaidIcon /> },
        { label: "Perfil", path: "/perfil", icon: <PersonIcon /> },
      ]
    : isBarber
    ? barberItems
    : clientItems;
  const extraItems = isAdmin
    ? [
        { label: "Horários", path: "/horarios", icon: <ScheduleIcon /> },
        { label: "Serviços", path: "/servicos", icon: <ContentCutIcon /> },
        { label: "Barbeiros", path: "/barbeiros", icon: <GroupIcon /> },
      ]
    : [];

  const hasMore = extraItems.length > 0;
  const items = hasMore
    ? [
        ...primaryItems,
        { label: "Mais", path: "__more__", icon: <MoreHorizIcon /> },
      ]
    : primaryItems;

  const currentIndex = items.findIndex((item) => location.pathname === item.path);
  const isInExtra = extraItems.some((item) => location.pathname === item.path);
  const value = currentIndex >= 0 ? currentIndex : isInExtra ? items.length - 1 : 0;

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
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => {
          const target = items[newValue];
          if (!target) return;
          if (target.path === "__more__") {
            setMoreOpen(true);
            return;
          }
          navigate(target.path);
        }}
        sx={{
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            paddingX: 1.5,
          },
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            color: "primary.main",
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: 11,
            lineHeight: 1.2,
          },
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            aria-label={item.label}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </BottomNavigation>

      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
      >
        <List>
          {extraItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => {
                setMoreOpen(false);
                navigate(item.path);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={() => setMoreOpen(false)}>
            <ListItemText primary="Fechar" />
          </ListItemButton>
        </List>
      </Drawer>
    </Paper>
  );
}
