import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Registration from "./pages/Registration";
import BirthdayDetails from "./pages/BirthdayDetails";
import SongSelectionPage from "./pages/SongSelectionPage";
import SongPage from "./pages/SongPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/birthday-details" element={<BirthdayDetails />} />
        <Route path="/song-selection" element={<SongSelectionPage />} />
        <Route path="/song" element={<SongPage />} />
      </Routes>
    </Router>
  );
}

export default App;
