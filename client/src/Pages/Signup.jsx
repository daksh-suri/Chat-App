import React, { useState } from "react";
import useAuth from "../context/authContext";
import auth from "../lib/auth";
import { useNavigate } from "react-router";

const Signup = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await signup({ name: name.trim(), email: email.trim(), password });
      auth.token = token;
      auth.user = user;
      navigate("/dashboard");
    } catch {
      // Error already shown via alert in authApi
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start chatting with a clean, modern workspace.</p>
        <form className="auth-form" onSubmit={formSubmitHandler}>
          <label className="auth-field">
            <span className="auth-label">Name</span>
            <input
              className="auth-input"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Your name"
            />
          </label>

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
              placeholder="Create a password"
            />
          </label>

          <button className="primary-btn" type="submit">Sign up</button>
        </form>
        <p className="auth-switch">
          Already a user? <button className="secondary-btn" onClick={() => navigate('/signin')}>Sign in</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
