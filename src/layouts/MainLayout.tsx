import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

import Sidebar from '../components/Sidebar';

const MainLayout: React.FC = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F9FAFB' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
