import { Route, Routes } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import HompePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import CreateSubjectPage from "./pages/CreateSubjectPage";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/homepage" element={<HompePage />} />
        <Route path="/room/create" element={<CreateRoomPage />} />
        <Route path="/subject/create" element={<CreateSubjectPage />} />
      </Route>
    </Routes>
  );
}

export default App;
