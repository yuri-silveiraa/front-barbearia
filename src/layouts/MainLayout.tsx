import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  function handleNavigate(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <Box sx={{ display: "flex" }}>
      
      {/* HEADER */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Barbearia Douglas
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

      {/* DRAWER */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            <ListItemButton onClick={() => handleNavigate("/reservas")}>
              <ListItemText primary="Reservas" />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavigate("/clientes")}>
              <ListItemText primary="Clientes" />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavigate("/barbeiros")}>
              <ListItemText primary="Barbeiros" />
            </ListItemButton>

            <ListItemButton onClick={logout}>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* CONTEÚDO PRINCIPAL */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // espaço por causa do header
          width: "100%"
        }}
      >
        <Outlet />
      </Box>

    </Box>
  );
}
