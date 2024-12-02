import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WishlistForm from './WishlistForm';
import PickSecretBox from './PickSecretBox';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WishlistForm />} />
        <Route path="/wishlist/pick" element={<PickSecretBox />} />
      </Routes>
    </Router>
  );
}

export default App;
