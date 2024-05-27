import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UserDetail from "./pages/UserDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Navigate to={"/"} />} />
        <Route path="/" element={<Home />} />
        <Route path="/user/:id" element={<UserDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
