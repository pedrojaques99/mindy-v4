import React from "react";
import { Outlet, Link } from "react-router-dom";
import { supabase } from "../main";

const Layout = ({ session }) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            Mindy Resource Library
          </Link>
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              {session ? (
                <>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="btn btn-secondary">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                  <li>
                    <Link to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Mindy Resource Library. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 