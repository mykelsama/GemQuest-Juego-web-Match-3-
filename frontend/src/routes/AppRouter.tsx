import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import LevelSelect from "../pages/LevelSelect/LevelSelect";
import Game from "../pages/Game/Game";
import Scores from "../pages/Scores/Scores";
import Results from "../pages/Results/Results";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

/** Define las rutas publicas de la aplicacion React. */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game" element={<Game />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}