import React from "react";
import useAuth from "../context/authContext";
import auth from "../lib/auth";
import { useNavigate } from "react-router";
import { useState } from "react";

const Signin = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const {signin} = useAuth();

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    const {user, token} = await signin({email, password});
  
    auth.token = token;
    auth.user = user;
    navigate("/dashboard");
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue your conversations.</p>
        <form className="auth-form" onSubmit={formSubmitHandler}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter your password"
            />
          </label>

          <button className="primary-btn" type="submit">Sign in</button>
        </form>
        <p className="auth-switch">
          Not a user yet? <button className="secondary-btn" onClick={() => navigate("/signup")}>Create account</button>
        </p>
      </div>
    </div>
  );
};

export default Signin;
