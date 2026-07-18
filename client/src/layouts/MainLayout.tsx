import { Navigate, Outlet } from "react-router";

export default function MainLayout() {
  if (!localStorage.getItem("access_token")) {
    return <Navigate to={"/"} />;
  }
  return <Outlet />;
}
