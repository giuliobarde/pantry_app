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
        try {
            const response = await this.client.post(
                '',
                {
                    prompt: `Suggest a singular recipes based only on the following: ${ingredients.join(', ')}`,
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
