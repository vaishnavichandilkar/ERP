import React from 'react';

const Footer = () => {
    return (
        <footer style={{ padding: '10px 20px', textAlign: 'center', background: '#f8f9fa' }}>
            <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
