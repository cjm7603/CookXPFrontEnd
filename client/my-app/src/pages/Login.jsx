import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { CircularProgress } from "@mui/material";
import logo from "../assets/logo.png";

import "../styling.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUserInfo } = useUser();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/user/login",
        { username, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const userInfo = { id: data.id, username: data.username, email: data.email, token: data.token };

      setUserInfo(userInfo);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      navigate("/home");
    } catch (error) {
      setError("Invalid username or password");
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
              Welcome Back!
            </div>

            <div className="inputs">
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

            <button onClick={handleLogin} className="login-button">
              {loading ? <CircularProgress size={24} color="white"/> : "Login"}
            </button>
            <div className="signup-nav">
              Don’t have an account? <span className="signup-link" onClick={() => navigate("/signup")}>Sign Up</span>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Login;
