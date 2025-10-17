import { createBrowserRouter, RouterProvider } from "react-router";
import LadingPage from "./landing";
import RootLayout from "../app.layout";
import NotFound from "./NotFound";
import AuthCallback from "./auth/callback";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "./dashboard/home";
import NewExtract from "./dashboard/extracts/new";
import EditExtract from "./dashboard/extracts/edit";
import ExtractsPage from "./dashboard/extracts";
import ThemesPage from "./dashboard/themes";
import VideosPage from "./dashboard/videos";
import VideoDetailsPage from "./dashboard/videos/details";
import VideoBuilder from "./dashboard/video/builder";
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
          { path: "extracts", element: <ExtractsPage /> },
          { path: "extracts/new", element: <NewExtract /> },
          { path: "extracts/:id/edit", element: <EditExtract /> },
          { path: "themes", element: <ThemesPage /> },
          { path: "videos", element: <VideosPage /> },
          { path: "videos/:id", element: <VideoDetailsPage /> },
          { path: "video/builder", element: <VideoBuilder /> },
        ]
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
