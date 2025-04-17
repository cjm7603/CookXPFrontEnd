import React, { useState, useEffect } from "react";
import SideNav from "../components/SideNav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import Recipe from "../components/Recipe";
import {RecipeModel} from '../models/RecipeModel';
import { FaRectangleXmark, FaUser } from "react-icons/fa6";
import { Checkbox, Progress } from "antd";

import "../styling.css";

const Home = () => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(RecipeModel);
  const [loading, setLoading] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userAchievements, setUserAchievements] = useState(null);
  const [error, setError] = useState("");

  const toggleRecipe = () => {
    setRecipeOpen(!recipeOpen);
  }

  const handleGetRandomRecipe = async () => {
    setLoading(true);
    setError("");
    try {

      const response = await axios.get("http://localhost:5000/recipe/random");
      const data = response.data;

      if(data && data.meals && data.meals.length > 0){
        setRecipe(data.meals[0]);
      }
      else{
        setError("No recipe found!");
      }
    } catch (error) {
      setError("Recipe fetch failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetSavedRecipe = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/user/recipe/"+token.username);
      const data = response.data;
      if(data && data.recipeDetails.recipe_id > 0){
        const response2 = await axios.get("http://localhost:5000/recipe/"+data.recipeDetails.recipe_id);
        const data2 = response2.data;
        if(data2 && data2.meals && data2.meals.length > 0){
          setRecipe(data2.meals[0]);
        }
        else{
          handleGetRandomRecipe();
        }
      }
      else{
        console.log("No saved recipe found!");
        handleGetRandomRecipe();
      }
    } catch (error) {
      setError("Recipe fetch failed. Please try again.");
      console.log("Error " + error);
      handleGetRandomRecipe();
    } finally {
      setLoading(false);
    }
  }

  

  const handleGoToProfile = () => {
    navigate("/profile");
  }

  const handleGoToSignup = () => {
    navigate("/signup");
  };

  const handleGetUserInfo = async () => {

    try {
        const { data } = await axios.get('http://localhost:5000/user/' + token.username);
        const achievementResponse = await axios.get("http://localhost:5000/achievement/user/" + token.username);
        if(data && data.userDetails ){
            setUserInfo(data.userDetails);
            setUserAchievements(achievementResponse.data.data);
            handleGetSavedRecipe();
        }
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
      const storedData = localStorage.getItem('userInfo');
      if(storedData) {
          setToken(JSON.parse(storedData));
      }
      else{
          handleGoToSignup();
      }
  }, []);

  useEffect(() => {
      if (token) {
          handleGetUserInfo();
      }
  }, [token]);

  const checkCompleteRecipe = async () => {
    const completeRecipe = {
        recipe_id: recipe.idMeal,
        username: token.username,
        is_completed: true
    }
    try {
      //mark user recipe complete
      const response = await axios.put('http://localhost:5000/user/recipe/completeRecipe', completeRecipe);
      console.log(response);
      if(response){
          if(response.status == 200) {
              console.log("recipe marked complete");
          }
          else{
              console.log(response);
          }
      }

      //increment user exp
      //count ingredients
      const ingredientCount = Object.keys(recipe).filter(
        key => key.startsWith("strIngredient") && recipe[key]
      ).length;
      //logic for updating chef level
      const level = userInfo.chef_level + (ingredientCount * 3) + 10;
      const data = {
        username: userInfo.username,
        chef_level: level
      }
      const response2 = await axios.put("http://localhost:5000/user/"+userInfo.username, data);
      if(response2.status == 200) {
        console.log("user exp updated");
        await handleAchievementUpdates();
      }
      else{
          console.log(response2);
      }

    } catch (error) {
        console.log(error);
    }

    navigate(0);
  }

  const handleAchievementUpdates= async () => {
    try{
      const response = await axios.get("http://localhost:5000/user/recipe/all/"+userInfo.username);
      if(response){
        if (response.status==200){
          const meals = response.data.data;
          if(userAchievements.length==0){
            //adding achievement for joining
           const data = {
            username:userInfo.username,
            name: "Profile Created",
            description: "Welcome to the app, Chef! This is your first achievement :)"
           }
           const resp2 = await axios.post("http://localhost:5000/achievement/create", data);

           //adding achievement for making first recipe (since func is only called on recipe completion)
           const data2 = {
            username:userInfo.username,
            name: "1st Recipe Completion",
            description: "You've completed your first recipe! Good Job!"
           }
           const resp3 = await axios.post("http://localhost:5000/achievement/create", data2);
          }
          //if 3 meals
          else if(meals.length == 3){
            const data ={
              username:userInfo.username,
              name: "3 Recipes Completed",
              description: "You've completed 3 Recipes! You're on your way to becoming a master chef!"
            }
            const resp = await axios.post("http://localhost:5000/achievement/create", data);
          }
          else if(meals.length % 5 == 0){
            const data ={
              username:userInfo.username,
              name: meals.length + " Recipes Completed",
              description: "You've completed " +meals.legnth+" Recipes! You're amazing!"
            }
            const resp = await axios.post("http://localhost:5000/achievement/create", data);
          }
          
        }
        
        else{
          console.log(response);
        }
      }
    }
    catch(error){
      console.log(error);
    }
  }

  const renderIngredients = () => {
    return(
        <div>
            {Object.keys(recipe).map((key, index) => {
            if (key.startsWith("strIngredient") && recipe[key]) {
                const measureKey = `strMeasure${key.replace("strIngredient", "")}`;
                return (
                  <div key={index}>
                    <Checkbox className="item">
                      {recipe[measureKey] || ""} {recipe[key]}
                    </Checkbox>
                    <br/>
                  </div>
                );
            }
            return null;
            })}
        </div>
    );
  }

  const renderDirections = () => {
    const parts = recipe.strInstructions.split('.');

    return(
        <div>
            {parts.splice(0,parts.length-1).map((part, index) => (
              <div key={index} className="item">
                <div>
                  {index + 1}. {part}
                </div>
                
                {index < parts.length - 1 && <br/>}
              </div>
            ))}
        </div>
    );
  }

  const renderChefRank = () => {
    let rank = "";
    const points = userInfo?.chef_level;

    if (points >= 0 && points < 100) {
        rank = "Dishwasher";
    }
    else if (points >= 100 && points < 200) {
        rank = "Junior Chef";
    }
    else if (points >= 200 && points < 300) {
        rank = "Grill Chef";
    }
    else if (points >= 300 && points < 400) {
        rank = "Entree Chef";
    }
    else if (points >= 400 && points < 500) {
        rank = "Relief Chef";
    }
    else if (points >= 500 && points < 600) {
        rank = "Deputy Chef";
    }
    else if (points >= 600 && points < 700) {
        rank = "Head Chef";
    }
    else if (points >= 700) {
        rank = "Executive Chef";
    }

    return (
        <div>
            {rank}
        </div>
    )
  } 

  return (
    <div className="home">
      <SideNav />
      <div className="body">
        <div className="title">
            <div className="hello">
              Hello, <span className="bold">Chef {userInfo?.username}!</span>
            </div>
            <div className="user" onClick={handleGoToProfile}>
              <div className="profilePic">
                <FaUser color="white"/>
              </div>
              {userInfo?.username}
            </div>
        </div>

        <div className="content">
          <div className="left">
            <div className="levels">
              <div className="current">
                <div className="rank">
                  {renderChefRank()}
                </div>
                <div className="status">
                  <div className="points">
                    <div>
                      Level {Math.floor(userInfo?.chef_level/100)}
                    </div>
                    <div>
                    {userInfo?.chef_level%100} points
                    </div>
                  </div>
                  <div className="bar">
                    <Progress percent={userInfo?.chef_level%100} size={[ , 30]} trailColor="white" strokeColor="#FF8F49" showInfo={false}/>
                  </div>
                  <div className="labels">
                    <div>
                      LEVEL {Math.floor(userInfo?.chef_level/100)}
                    </div>
                    <div>
                      LEVEL {Math.floor(userInfo?.chef_level/100) + 1}
                    </div>
                  </div>
                </div>
              </div>
              <div className="next">
                {100 - userInfo?.chef_level%100} points until level {Math.floor(userInfo?.chef_level/100) + 1}!
              </div>
            </div>
            <div className="ingredients">
              <div className="heading">
                Ingredients Needed:
              </div>
              <div className="list">
                {renderIngredients()}
              </div>
            </div>
          </div>
          <div className="right">
            <div className="tagline">
              What's cooking?
            </div>
            <div className="card">
              <div className="photo" style={{ backgroundImage: `url(${recipe?.strMealThumb})`}} />
              
              <div className="info">
                <div className="name">
                  {recipe?.strMeal}
                </div>
                <div className="viewButton" onClick={toggleRecipe}>
                  View Recipe
                </div>
              </div>
            </div>
            
            <div className="button" onClick={checkCompleteRecipe}
              //checkCompleteRecipe}
              >
              {loading ? <CircularProgress size={24} color="white"/> : "Mark Completed"}
            </div>
          </div>
        </div>
      </div>

      {recipeOpen ? <div className="recipeOpen">
        <div className="modal">
          <div className="title">
            <div className="name">
              {recipe?.strMeal}
            </div>
            <div className="close" onClick={toggleRecipe}>
              <FaRectangleXmark className="icon"/>
            </div>
          </div>
          <div className="recipeInfo">
            <div className="left">
              <div className="photo">
                <img src={recipe?.strMealThumb} className="thumbnail"/>
              </div>
              <div className="ingredients">
                <div className="heading">
                  Ingredients
                </div>
                
                <div className="list">
                  {renderIngredients()}
                </div>
              </div>
            </div>

            <div className="directions">
              <div className="heading">
                Directions
              </div>
              <div className="list">
                {renderDirections()}
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default Home;
