import { Link, useNavigate } from "react-router-dom";
import { Building2, LogOut, LayoutDashboard, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Building2 className="w-7 h-7" />
          <span>EstateFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">
            Explore
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Agent Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-red-600 px-2 py-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Agent Portal
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}