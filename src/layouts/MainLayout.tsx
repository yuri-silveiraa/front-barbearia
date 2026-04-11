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
  const headerOffset = { xs: "calc(56px + 16px)", sm: "calc(64px + 24px)" };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
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
          pt: headerOffset,
          pb: { xs: 10, md: 3 },
          ml: 0,
          width: "100%",
          backgroundColor: "background.default",
          minHeight: 0
        }}
      >
        <Outlet />
      </Box>

      {isMobile && <MobileTabBar user={user} />}
    </Box>
  );
}
