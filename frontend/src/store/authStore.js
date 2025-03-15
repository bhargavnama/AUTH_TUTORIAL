import { create } from 'zustand';
import axios from 'axios';

const API_URL="http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async (email, password, name) => {
        set({isLoading: true, error: null});
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password, name });
            set({ user: response.data?.user, isAuthenticated: true });
        } catch (error) {
            set({error: error?.response?.data?.message || "Error signing up", isLoading: false});
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({isLoading: true, error: null});
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            set({isLoading: false, isAuthenticated: true, user: response.data?.user});
        } catch (error) {
            set({error: error?.response?.data?.message || "Error verifying email", isLoading:false});
            throw error;
        }
    },

    checkAuth: async () => {
        set({isCheckingAuth: true, error: null});

        try {
            const response = await axios.post(`${API_URL}/check-auth`);
            set({user: response.data.user, isAuthenticated: true, isCheckingAuth: false});
        } catch (error) {
            set({ error: null, isCheckingAuth: false, isAuthenticated: false });
        }
    }
}))