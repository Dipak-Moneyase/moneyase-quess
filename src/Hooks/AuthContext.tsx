import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
	user: any;
	token: string | null;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<any>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('authToken') || sessionStorage.getItem('authToken'),
	);

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
	};

	return (
		<AuthContext.Provider value={{ user, token, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
