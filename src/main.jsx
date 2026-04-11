import React from "react";
import { createRoot } from "react-dom/client";
import AuroraHealth from "./AuroraHealth.jsx";
import { SpeedInsights } from "@vercel/speed-insights/react";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuroraHealth />
    <SpeedInsights />
  </React.StrictMode>
);
