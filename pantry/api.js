import axios from 'axios';

class ApiService {
    constructor() {
        this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

        if (!this.apiKey) {
            throw new Error('API key is missing. Please set REACT_APP_OPENROUTER_API_KEY or NEXT_PUBLIC_OPENROUTER_API_KEY in your environment.');
        }

        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async fetchRecipeSuggestions(ingredients) {
        // Ensure ingredients is an array
        if (!Array.isArray(ingredients)) {
            throw new TypeError('Ingredients should be an array.');
        }
    
        const prompt = `Here are some example recipes:
    
    1. **Chicken Salad**:
       - **Ingredients**: chicken breast, mayonnaise, celery
       - **Instructions**:
         1. Cook the chicken breast and shred it.
         2. Mix the shredded chicken with mayonnaise and chopped celery.
         3. Season with salt and pepper to taste.
    
    2. **Veggie Stir-Fry**:
       - **Ingredients**: bell peppers, broccoli, soy sauce
       - **Instructions**:
         1. Stir-fry the bell peppers and broccoli in a pan.
         2. Add soy sauce and cook until the vegetables are tender.
    
    3. **Guacamole**:
       - **Ingredients**: avocado, tomato, onion, cilantro, lime
       - **Instructions**:
         1. Peel and mash the avocado.
         2. Dice the tomato and onion.
         3. Mix avocado with tomato, onion, cilantro, and lime juice.
         4. Serve with chips.
    
    Based on the following ingredients:
    ${ingredients.join(', ')}
    
    Generate a new recipe using some or all of these ingredients. The recipe should include a title, a list of ingredients, and step-by-step instructions. Ensure that the recipe is practical and only uses the listed ingredients. Do not include any part of this prompt in the response.`;
    
        try {
            const response = await this.client.post('', { prompt });
            // Optionally validate the recipe here before returning
            return response.data;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }
    
    handleError(error) {
        if (error.response) {
            console.error('API Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('API Error: No response received', {
                request: error.request
            });
        } else {
            console.error('API Error:', error.message);
        }
    }    
}

export default ApiService;
