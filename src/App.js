/**
=========================================================
* Soft UI Dashboard React - v4.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Soft UI Dashboard React examples
import Sidenav from "examples/Sidenav";

// Soft UI Dashboard React themes
import theme from "assets/theme";

// Soft UI Dashboard React routes
import routes from "routes";

// Soft UI Dashboard React contexts
import { useSoftUIController, setMiniSidenav } from "context";

import { AuthenticatedRoutesWrapper } from "@elrondnetwork/dapp-core/wrappers";
import { SignTransactionsModals } from "@elrondnetwork/dapp-core/UI/SignTransactionsModals";
// import { NotificationModal } from "@elrondnetwork/dapp-core/UI/NotificationModal";
import SignIn from "layouts/authentication/sign-in";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransactionsToastList } from "@elrondnetwork/dapp-core/UI";

const queryClient = new QueryClient();

export default function App() {
  const [controller, dispatch] = useSoftUIController();
  const { miniSidenav, direction, layout, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.path) {
        return <Route exact path={route.path} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <TransactionsToastList />
        <SignTransactionsModals />
        {/* <NotificationModal /> */}

        <CssBaseline />
        <AuthenticatedRoutesWrapper routes={routes} unlockRoute="/sign-in">
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={"https://karitha.io/assets/img/logos/logo.svg"}
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
            </>
          )}
          <Routes>
            {getRoutes(routes)}
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/staking" />} />
          </Routes>
        </AuthenticatedRoutesWrapper>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
