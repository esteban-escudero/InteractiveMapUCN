import { render, screen } from '@testing-library/react';
import App from './App';

// Mock components to avoid deep rendering and Leaflet issues
// Using relative paths to match App.js imports exactly
jest.mock("./components/Map", () => ({ Map: () => <div data-testid="mock-map">MockMap</div> }));
jest.mock("./components/user/UserMapView", () => () => <div data-testid="mock-user-map">MockUserMapView</div>);
jest.mock("./components/auth/ProtectedRoute", () => ({ children }) => <>{children}</>);

// Mock AuthContext
jest.mock("./contexts/AuthContext", () => ({
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

test('renders app without crashing', () => {
    render(<App />);
    // Check if AuthProvider is rendered
    const provider = screen.getByTestId("auth-provider");
    expect(provider).toBeInTheDocument();

    // App usually renders one of the routes. 
    const userMap = screen.getByTestId("mock-user-map");
    expect(userMap).toBeInTheDocument();
});
