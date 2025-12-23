import axios from 'axios';
import { Location } from '../types/location';

const LOCATION_API_URL = 'https://api.example.com/locations'; // Replace with actual API endpoint

export const fetchLocations = async (): Promise<Location[]> => {
    try {
        const response = await axios.get<Location[]>(LOCATION_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
};

export const getLocationById = async (id: string): Promise<Location | null> => {
    try {
        const response = await axios.get<Location>(`${LOCATION_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching location with id ${id}:`, error);
        return null;
    }
};

export const searchLocations = async (query: string): Promise<Location[]> => {
    try {
        const response = await axios.get<Location[]>(`${LOCATION_API_URL}?search=${query}`);
        return response.data;
    } catch (error) {
        console.error('Error searching locations:', error);
        throw error;
    }
};