import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./AllRoutes";

export default function App() {
  return (
    <Router>
      <AllRoutes />
    </Router>
  );
}
