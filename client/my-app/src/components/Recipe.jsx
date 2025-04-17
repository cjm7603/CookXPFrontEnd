import React, { useState, useEffect } from "react";
import vector from "../assets/Vector.png";
import axios from "axios";
import {RecipeModel} from '../models/RecipeModel';
import "../styling.css";
import { useNavigate } from "react-router-dom";


const Recipe = ({recipe}) => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState("small");
    const [token, setToken] = useState(null);

    const checkCompleteRecipe = async () => {
        const completeRecipe = {
            recipe_id: recipe.idMeal,
            username: token.username,
            is_completed: true
        }
        try {
            const response = await axios.post('http://localhost:5000/user/createRecipeCompletion', completeRecipe);
            if(response){
                if(response.status == 201) {
                    console.log("recipe completed added");
                    navigate(0);
                }
                else{
                    console.log(response);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const flipViewMode = async () => {
        if(viewMode == "small"){
            setViewMode("large")
        }
        else{
            setViewMode("small")
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
                        {recipe[measureKey] || ""} {recipe[key]}
                    </div>
                    );
                }
                return null;
                })}
            </div>
        );
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

    if(viewMode == "small"){
        return (
            <button onClick={flipViewMode} className="clearButton">
                <div className="recipeCard">
                    <img src={recipe?.strMealThumb} alt="Recipe Thumbnail" className="image"/>
                    <div className="recipe">
                        {recipe?.strMeal}
                    </div>
                </div>
            </button>
        );
    }
    else if(viewMode == "large"){
        return (
            <div className="recipe">
                <div className="head">
                <div className="name">
                        {recipe?.strMeal}
                    </div>
                    <button onClick={flipViewMode} className="clearButton">
                        <img src={vector} alt="Close Tab" className="vector"/>
                    </button>
                </div>
                <div className="body">
                    <div className="left">
                        
                        <img src={recipe?.strMealThumb} alt="Recipe Thumbnail" className="picture"/>
                        <div className="ingredients">
                            <div className="heading">
                                Ingredients
                            </div>
                            <div className="list">
                                <div className="ingredient">{renderIngredients()}</div>
                            </div>
    
                        </div>
                    </div>
                    <div className="directions">
                        <div className="heading">
                            Directions
                        </div>
                        <div className="list">
                            {recipe?.strInstructions}
                        </div>
                        <button className="complete" onClick={checkCompleteRecipe}>Complete </button>
                    </div>
                </div>
            </div>
        );
    }
    else{
        return(
            <div>
                404
            </div>
        );
    }
    
};

export default Recipe;