import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import SelectInterests from './pages/SelectInterests';
import CreateContent from './pages/CreateContent';
import PostDetail from './pages/PostDetail';
import Documents from './pages/Documents';
import Discussions from './pages/Discussions';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/interests" element={<SelectInterests />} />
        <Route path="/create" element={<CreateContent />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
