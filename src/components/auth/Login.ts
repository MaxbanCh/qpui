import { BACKEND_URL } from '../../shared/env.ts';

export default class Auth {
    private isLoggedIn: boolean = false;

    async login(username: string, password: string): Promise<boolean> {
        await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'withCredentials': 'true',
            },
            body: JSON.stringify({ username, password }),
        }).then((response) => {
            if (response.ok) {
                this.isLoggedIn = true;
            }
        }).catch((error) => {
            console.error('Login failed:', error);
        });
        
        return this.isLoggedIn;
    }
}