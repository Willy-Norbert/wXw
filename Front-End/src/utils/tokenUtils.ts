
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: number;
  role: string;
  iat: number;
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    console.log('🕐 Token Utils: Checking token expiry...');
    console.log('🕐 Token Utils: Token expires at:', new Date(decoded.exp * 1000));
    console.log('🕐 Token Utils: Current time:', new Date(currentTime * 1000));
    console.log('🕐 Token Utils: Token expired?', decoded.exp < currentTime);
    
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('❌ Token Utils: Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('❌ Token Utils: Error getting token expiry:', error);
    return null;
  }
};

export const getTokenPayload = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('❌ Token Utils: Error getting token payload:', error);
    return null;
  }
};
