<script lang="ts">
import { ref } from 'vue';
import Auth from './Login.ts';

const auth = new Auth();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
    error.value = '';
    
    if (!username.value || !password.value) {
        error.value = 'Username and password are required';
        return;
    }
    
    loading.value = true;
    const success = await auth.login(username.value, password.value);
    loading.value = false;
    
    if (success) {
        // Redirect or emit success event
        console.log('Login successful');
    } else {
        error.value = 'Invalid username or password';
    }
};

export default {
    setup() {
        return {
            username,
            password,
            error,
            loading,
            handleLogin,
        };
    },
};
</script>

<template>
    <div class="login-container">
        <form @submit.prevent="handleLogin">
            <h2>Login</h2>
            
            <div v-if="error" class="error-message">
                {{ error }}
            </div>
            
            <div class="form-group">
                <label for="username">Username</label>
                <input
                    id="username"
                    v-model="username"
                    type="text"
                    placeholder="Enter your username"
                    :disabled="loading"
                />
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="Enter your password"
                    :disabled="loading"
                />
            </div>
            
            <button type="submit" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>
        </form>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

form {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    margin-bottom: 1.5rem;
}

.error-message {
    color: #d32f2f;
    background-color: #ffebee;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover:not(:disabled) {
    background-color: #1565c0;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>