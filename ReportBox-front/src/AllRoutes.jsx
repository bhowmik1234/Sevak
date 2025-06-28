import { Routes, Route } from "react-router-dom";
import Report from "./pages/Report";
import HomePage from "./pages/Home"
import AdminDashboard from "./components/AdminPage";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Chat from "./pages/Chat";
import Error from "./pages/Error";
import MainLayout from "./components/MainLayout";
import BlankLayout from "./components/BlankLayout";
import EmergencyContact from "./pages/EmergencyContact";


const AllRoutes = () => {
  return (
<Routes>
      {/* Layout with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<Report />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/emergency-contact" element={<EmergencyContact />} />
      </Route>

      {/* Layout without Navbar */}
      <Route element={<BlankLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default AllRoutes;