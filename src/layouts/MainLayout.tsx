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
  const headerHeight = { xs: 56, sm: 64 };

  return (
    <Box sx={{ display: "flex", minHeight: "100svh" }}>
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
          mt: headerHeight,
          pb: { xs: 10, md: 3 },
          ml: 0,
          width: "100%",
          backgroundColor: "background.default",
          minHeight: {
            xs: "calc(100svh - 56px)",
            sm: "calc(100svh - 64px)"
          }
        }}
      >
        <Outlet />
      </Box>

      {isMobile && <MobileTabBar user={user} />}
    </Box>
  );
}
