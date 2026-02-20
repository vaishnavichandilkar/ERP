import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routeConstants';

const Header = () => {
    const { logoutUser } = useAuth();

    return (
        <header style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>My App</h1>
            <nav>
                <button onClick={logoutUser}>Logout</button>
            </nav>
        </header>
    );
};

export default Header;
