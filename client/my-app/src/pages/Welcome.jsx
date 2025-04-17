import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

import "../styling.css";

const Welcome = () => {
  const navigate = useNavigate();

  const handleGoToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="welcome">
      <Header />

      <div className="body">
        <div className="heading">
          <div className="tagline">
            Cook, Play, Level Up!
          </div> 
          <div className="about">
            CookXP is a platform that allows you to level up your cooking skill and explore new recipes.
          </div> 
        </div>
        
        <button onClick={handleGoToSignup} className="signup-button">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Welcome;
