import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./main";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout session={session} />}>
          <Route index element={<HomePage session={session} />} />
          <Route path="login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="register" element={!session ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="profile" element={
            <ProtectedRoute session={session}>
              <ProfilePage session={session} />
            </ProtectedRoute>
          } />
          <Route path="edit-profile" element={
            <ProtectedRoute session={session}>
              <EditProfilePage session={session} />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
