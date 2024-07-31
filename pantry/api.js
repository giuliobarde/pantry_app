import axios from 'axios';

class ApiService {
    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY; // Ensure to prefix with NEXT_PUBLIC_ for client-side use
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

        if (!this.apiKey) {
            throw new Error('API key is missing. Please set NEXT_PUBLIC_OPENROUTER_API_KEY in your .env.local file.');
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
        try {
            const response = await this.client.post(
                '',
                {
                    prompt: `Suggest recipes based on these ingredients: ${ingredients.join(', ')}`,
                }
            );
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
