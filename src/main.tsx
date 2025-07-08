import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
console.log('VITE_CONVEX_URL:', convexUrl);

if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL environment variable is not set');
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexAuthProvider>
  </ConvexProvider>
);
