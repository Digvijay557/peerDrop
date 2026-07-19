import { Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import Home from "./pages/Home";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/home" element={<Home />} />
        </Routes>
    );
}

export default App;