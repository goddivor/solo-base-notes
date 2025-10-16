import { createBrowserRouter, RouterProvider } from "react-router";
import LadingPage from "./landing";
import RootLayout from "../app.layout";
import NotFound from "./NotFound";
import AuthCallback from "./auth/callback";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "./dashboard/home";
import NewExtract from "./dashboard/extracts/new";
import ThemesPage from "./dashboard/themes";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LadingPage /> },
      { path: "/auth/callback", element: <AuthCallback /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "extracts/new", element: <NewExtract /> },
          { path: "themes", element: <ThemesPage /> },
        ]
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
