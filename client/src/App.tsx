import { Route, Routes } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import HompePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import CreateSubjectPage from "./pages/CreateSubjectPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import CallingPage from "./pages/CallingPage";
import CreateTodoPage from "./pages/CreateTodoPage";

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
        <Route path="/room/:id/create/todo" element={<CreateTodoPage />} />
        <Route
          path="/room/:id/edit/todo/:todoId"
          element={<CreateTodoPage />}
        />
        <Route path="/subject/create" element={<CreateSubjectPage />} />
        <Route path="/room/:id" element={<ChatRoomPage />} />
        <Route path="/room/calling/:id" element={<CallingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
