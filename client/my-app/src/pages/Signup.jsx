import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import logo from "../assets/logo.png";

import "../styling.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/user/signup", { email, username, password });
      navigate("/login");
    } catch (error) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="container">
        <div className="upper">
          <img src={logo} alt="CookXP Logo" className="logo"/>
        </div>
        <div className="lower">
          <div className="prompt">
            Welcome!
            
            <div className="instructions">
              Create an account to get started
            </div>
          </div>

          <div className="inputs">
            <div className="input">
              Email
              <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field"/>
            </div>

            <div className="input">
              Username
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field"/>
            </div>

            <div className="input">
              Password
              <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field"/>
            </div>

            {error && <div className="error">{error}</div> }
          </div>

          <button onClick={handleSignup} className="login-button">
            {loading ? <CircularProgress size={24} color="white"/> : "Sign Up"}
          </button>
          <div className="signup-nav">
            Already have an account? <span className="signup-link" onClick={() => navigate("/login")}>Login</span>
          </div>
        </div>
      </div>
  </div>
  );
};

export default Signup;