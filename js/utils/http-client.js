// src/utils/http-client.js

class HttpError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
  }
}

class HttpClient {
  constructor(baseUrl = '', defaultConfig = {}) {
    this.baseUrl = baseUrl;
    this.defaultConfig = {
      timeout: 10000, // 10 seconds default timeout
      retries: 3,     // Default retry attempts
      retryDelay: 1000, // Default delay between retries in ms
      headers: {
        'Content-Type': 'application/json',
      },
      ...defaultConfig,
    };
  }

  async fetchWithTimeout(url, config) {
    const { timeout = this.defaultConfig.timeout } = config;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new HttpError(
        response.statusText || 'Request failed',
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }

  async retryRequest(url, config, attempt = 1) {
    try {
      const response = await this.fetchWithTimeout(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (
        attempt < (config.retries || this.defaultConfig.retries) &&
        (error instanceof HttpError || error instanceof TypeError)
      ) {
        await new Promise(resolve =>
          setTimeout(resolve, config.retryDelay || this.defaultConfig.retryDelay)
        );
        return this.retryRequest(url, config, attempt + 1);
      }
      throw error;
    }
  }

  buildUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }

  async get(endpoint, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'GET',
    });
  }

  async post(endpoint, data, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'DELETE',
    });
  }
}

// Export both the class and a default instance
export const httpClient = new HttpClient();
export default HttpClient;

/*****************/
// Basic usage
/*****************/

// Import the client
// import HttpClient from './utils/http-client';

// Create an instance with base URL
// const api = new HttpClient('https://api.example.com');

// Example usage
// async function fetchUserData(userId) {
//   try {
//     const response = await api.get(`/users/${userId}`);
//     return response.data;
//   } catch (error) {
//     if (error instanceof HttpError) {
//       console.error(`Request failed with status: ${error.status}`);
//     }
//     throw error;
//   }
// }

// POST example
// async function createUser(userData) {
//   try {
//     const response = await api.post('/users', userData, {
//       timeout: 5000,
//       retries: 2
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Failed to create user:', error);
//     throw error;
//   }
// }