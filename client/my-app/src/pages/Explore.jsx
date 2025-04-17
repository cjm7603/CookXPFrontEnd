import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideNav from "../components/SideNav";
import { FaFilter, FaMagnifyingGlass, FaRectangleXmark } from "react-icons/fa6";
import { ConfigProvider, Input, Checkbox } from "antd";
import "../styling.css";

/**
 * Updated so that the Explore page shows *different* recipes instead of repeating the
 * same recipe card. The styling, overall structure, and existing logic (auth, search
 * placeholder, etc.) are unchanged.
 */

const NUM_CARDS = 6; // how many recipe cards to show

const Explore = () => {
  const navigate = useNavigate();

  // Hold an array of recipes instead of a single recipe
  const [recipes, setRecipes] = useState([]);

  // The recipe currently shown in the modal (null when closed)
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeOpen, setRecipeOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /**
   * Fetch N random recipes concurrently and store them in state.
   */
  const fetchRandomRecipes = async () => {
    setLoading(true);
    setError("");
    try {
      const requests = Array.from({ length: NUM_CARDS }, () =>
        axios.get("http://localhost:5000/recipe/random")
      );

      const responses = await Promise.all(requests);
      const newRecipes = responses
        .map((res) => res.data?.meals?.[0])
        // Filter out any undefined / null responses and accidental duplicates
        .filter((meal, idx, self) => !!meal && self.findIndex((m) => m.idMeal === meal.idMeal) === idx);

      setRecipes(newRecipes);

      // If we somehow ended up with fewer than requested (duplicate filtering), fetch until filled
      while (newRecipes.length < NUM_CARDS) {
        const { data } = await axios.get("http://localhost:5000/recipe/random");
        if (data?.meals?.[0] && !newRecipes.some((m) => m.idMeal === data.meals[0].idMeal)) {
          newRecipes.push(data.meals[0]);
        }
      }
      setRecipes([...newRecipes]);
    } catch (err) {
      console.error(err);
      setError("Recipe fetch failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key == "Enter"){
      fetchSearchedRecipes()
    }
  }

  const fetchSearchedRecipes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/recipe/name/" + search);
      const meals = response.data?.meals || [];
      console.log(meals);
      const newRecipes = meals.filter(
        (meal, idx, self) => self.findIndex((m) => m.idMeal === meal.idMeal) === idx
      );
      setRecipes(newRecipes);

      // If we somehow ended up with fewer than requested (duplicate filtering), fetch until filled
      while (newRecipes.length < NUM_CARDS) {
        const { data } = await axios.get("http://localhost:5000/recipe/random");
        if (data?.meals?.[0] && !newRecipes.some((m) => m.idMeal === data.meals[0].idMeal)) {
          newRecipes.push(data.meals[0]);
        }
      }
      setRecipes([...newRecipes]);
    } catch (err) {
      console.error(err);
      setError("Recipe fetch failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save a recipe for the current user.
   */
  const handleSaveRecipe = async (recipe) => {
    if (!recipe || !token) return;
    const data = {
      recipe_id: recipe.idMeal,
      username: token.username,
      is_completed: false,
    };
    try {
      const response = await axios.post("http://localhost:5000/user/saveRecipe", data);
      if (response?.status === 201) {
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Modal helpers
   */
  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setRecipeOpen(true);
  };

  const closeRecipeModal = () => {
    setRecipeOpen(false);
    setSelectedRecipe(null);
  };

  // Load user info from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      setToken(JSON.parse(stored));
    } else {
      navigate("/signup");
    }
  }, [navigate]);

  // Once we have a token, fetch recipes
  useEffect(() => {
    if (token) {
      fetchRandomRecipes();
    }
  }, [token]);

  /**
   * Helpers to render modal content based on selectedRecipe
   */
  const renderIngredients = () => {
    if (!selectedRecipe) return null;
    return Object.keys(selectedRecipe).map((key, index) => {
      if (key.startsWith("strIngredient") && selectedRecipe[key]) {
        const measureKey = `strMeasure${key.replace("strIngredient", "")}`;
        return (
          <div key={index}>
            <Checkbox className="item">
              {selectedRecipe[measureKey] || ""} {selectedRecipe[key]}
            </Checkbox>
            <br />
          </div>
        );
      }
      return null;
    });
  };

  const renderDirections = () => {
    if (!selectedRecipe?.strInstructions) return null;
    const parts = selectedRecipe.strInstructions.split(".").filter(Boolean);
    return parts.map((part, idx) => (
      <div key={idx} className="item">
        <div>
          {idx + 1}. {part}
        </div>
        {idx < parts.length - 1 && <br />}
      </div>
    ));
  };

  /**
   * Filter recipes client‑side by search term (placeholder logic; replace with
   * real search once backend supports it).
  */
  const visibleRecipes = recipes.filter((r) =>
    r.strMeal.toLowerCase()
    //r.strMeal.toLowerCase().includes(search.toLowerCase())
  );
  

  return (
    <div className="explore">
      <SideNav />

      <div className="body">
        <div className="title">Explore Recipes</div>
        <div className="filterSearch">
          <div className="search">
            <ConfigProvider
              theme={{
                token: {
                  fontFamily: "Lato",
                  fontSize: "16px",
                },
              }}
            >
              <Input
                prefix={<FaMagnifyingGlass className="icon" />}
                placeholder="Search..."
                variant="borderless"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                onKeyDown={handleKeyDown}
              />
            </ConfigProvider>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="content">
          <div className="cards">
            {visibleRecipes.map((recipe) => (
              <div
                className="card"
                key={recipe.idMeal}
                onClick={() => openRecipeModal(recipe)}
              >
                <div
                  style={{ backgroundImage: `url(${recipe.strMealThumb})` }}
                  className="photo"
                />

                <div className="name">{recipe.strMeal}</div>
                <div className="add">
                  {/* Stop click so that saving doesn't also open the modal */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveRecipe(recipe);
                    }}
                  >
                    Add Recipe
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recipeOpen && selectedRecipe && (
        <div className="recipeOpen">
          <div className="modal">
            <div className="title">
              <div className="name">{selectedRecipe.strMeal}</div>
              <div className="close" onClick={closeRecipeModal}>
                <FaRectangleXmark className="icon" />
              </div>
            </div>
            <div className="recipeInfo">
              <div className="left">
                <div className="photo">
                  <img src={selectedRecipe.strMealThumb} className="thumbnail" />
                </div>
                <div className="ingredients">
                  <div className="heading">Ingredients</div>

                  <div className="list">{renderIngredients()}</div>
                </div>
              </div>

              <div className="directions">
                <div className="heading">Directions</div>
                <div className="list">{renderDirections()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
