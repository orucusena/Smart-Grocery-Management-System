const API_BASE = "https://www.themealdb.com/api/json/v1/1";

export async function getMealsByIngredient(ingredient: string) {
  try {
    const response = await fetch(`${API_BASE}/filter.php?i=${ingredient}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
}

export async function getMealById(mealId: string) {
  try {
    const response = await fetch(`${API_BASE}/lookup.php?i=${mealId}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error("Error fetching meal by ID:", error);
    return null;
  }
}