import { Route, Routes } from "react-router";
import Login from "./pages/LoginPage";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import HompePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/homepage" element={<HompePage />} />
      </Route>
    </Routes>
  );
}

export default App;
