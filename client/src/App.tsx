import "./App.css";
import { Routes, Route } from "react-router-dom";
import CodingPage from "./components/CodingPage/CodingPage";
import LandingPage from "./components/LandingPage/LandingPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/coding" element={<CodingPage />} />
      </Routes>
    </>
  );
}

export default App;
