import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Recipe from "../components/Recipe";
import axios from "axios";
import "../styling.css";
import {RecipeModel} from '../models/RecipeModel';

const Test = () => {
  const [recipe, setRecipe] = useState(RecipeModel);

  const handleGetRandomRecipe = async () => {
    try {
      const response = await axios.get("http://localhost:5000/recipe/random");
      const data = response.data;

      if(data && data.meals && data.meals.length > 0){
        setRecipe(data.meals[0]);
      }
      else{
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    handleGetRandomRecipe();
  }, []);

  return (
    <div className="welcome">
      <Header />
      <Recipe recipe={recipe}/>
    </div>
  );
};

export default Test;
