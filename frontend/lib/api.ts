const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiRequest(endpoint: string, method: string = 'GET', data: any = null, token: string | null = null) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const responseData = await response.json();

        if (!response.ok) {
            // Pass along the error messages from the backend
            throw responseData || { message: `Error: ${response.status} ${response.statusText}` };
        }
        return responseData;
    } catch (error: any) {
        console.error(`API request failed: ${method} ${endpoint}`, error);
        // Rethrow the error so UI can handle it, ensure it's in a consistent format
        throw error.errors || error.detail || error.message || { message: "An unknown error occurred" };
    }
}