import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header, Sidebar, MobileTabBar } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header
        onMenuClick={() => !isMobile && setSidebarOpen(true)}
        showMenu={!isMobile}
      />
      
      {!isMobile && (
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          mt: { xs: 7, sm: 8 },
          pb: { xs: 10, md: 3 },
          ml: 0,
          width: "100%",
          backgroundColor: "background.default",
          minHeight: "calc(100vh - 64px)"
        }}
      >
        <Outlet />
      </Box>

      {isMobile && <MobileTabBar user={user} />}
    </Box>
  );
}
