import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Suspense
                fallback={
                  <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                    Loading page...
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}