import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WishlistForm from './WishlistForm';
import PickSecretBox from './PickSecretBox';
import Signup from "./Signup";
import Login from "./Login";
import { AuthProvider, AuthContext } from "./AuthContext";




const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WishlistForm />
              </ProtectedRoute>
            }
          />
          <Route
          path="/wishlist/pick"
          element={<PickSecretBox />}
        />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
