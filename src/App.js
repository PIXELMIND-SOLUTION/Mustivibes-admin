import { Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;