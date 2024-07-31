import ApiService from './api.js'; // Adjust the path as needed

async function testFetchRecipeSuggestions() {
    const apiService = new ApiService();
  
    const ingredients = ['tomato', 'cheese', 'basil']; // Test ingredients
    try {
      const recipeSuggestions = await apiService.fetchRecipeSuggestions(ingredients);
      console.log('Recipe Suggestions:', recipeSuggestions);
    } catch (error) {
      console.error('Failed to fetch recipe suggestions:', error);
    }
}
  
testFetchRecipeSuggestions();
