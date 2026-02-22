import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        userType={user?.type}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          mt: { xs: 7, sm: 8 },
          ml: 0,
          width: "100%",
          backgroundColor: "background.default",
          minHeight: "calc(100vh - 64px)"
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
