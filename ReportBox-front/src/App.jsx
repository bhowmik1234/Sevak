import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./AllRoutes";
// import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <AllRoutes />
    </Router>
  );
}
