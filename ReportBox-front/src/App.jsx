import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./AllRoutes";
import { LanguageProvider } from "./context/LanguageContext";
import SafetyExit from "./components/SafetyExit";

// import.meta.env.BASE_URL is "/Sevak/" on Pages, "/" elsewhere. Strip the
// trailing slash so react-router gets a clean basename ("/Sevak" or "").
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <LanguageProvider>
      <Router basename={basename}>
        <AllRoutes />
        <SafetyExit />
      </Router>
    </LanguageProvider>
  );
}
