import { Navigate, Outlet } from "react-router-dom";
import { isCaregiverRole, useSessionStore } from "@/store/sessionStore";

export function RequirePatient() {
  const session = useSessionStore((s) => s.session);
  if (!session || session.role !== "PATIENT") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export function RequireCaregiver() {
  const session = useSessionStore((s) => s.session);
  if (!session || !isCaregiverRole(session.role)) {
    return <Navigate to="/" replace />;
  }
  
  const token = localStorage.getItem("caregiver_token");
  if (!token) {
    return <Navigate to="/caregiver/login" replace />;
  }
  
  return <Outlet />;
}
