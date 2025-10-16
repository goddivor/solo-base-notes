import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRouter } from "./pages";
import { ToastProvider } from "./context/toast-context";
import { ToastContainer } from "./components/Toast";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./lib/apollo-client";
import { AuthProvider } from "./context/auth-context";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </ApolloProvider>
);
