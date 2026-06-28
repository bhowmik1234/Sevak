import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import BlankLayout from "./components/BlankLayout";

// Lazy-load pages so each route ships as its own chunk (smaller initial load).
const HomePage = lazy(() => import("./pages/Home"));
const Report = lazy(() => import("./pages/Report"));
const TrackReport = lazy(() => import("./pages/TrackReport"));
const AdminDashboard = lazy(() => import("./components/AdminPage"));
const Chat = lazy(() => import("./pages/Chat"));
const Documents = lazy(() => import("./pages/Documents"));
const LegalAid = lazy(() => import("./pages/LegalAid"));
const EmergencyContact = lazy(() => import("./pages/EmergencyContact"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/SignUp"));
const ErrorPage = lazy(() => import("./pages/Error"));

const RouteFallback = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AllRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Layout with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<Report />} />
          <Route path="/track" element={<TrackReport />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/legal-aid" element={<LegalAid />} />
          <Route path="/emergency-contact" element={<EmergencyContact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Layout without Navbar */}
        <Route element={<BlankLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default AllRoutes;
