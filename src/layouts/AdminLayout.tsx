import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout: React.FC = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header centerTitle="Admin Console" />
            <div style={{ display: 'flex', flex: 1 }}>
                <AdminSidebar />
                <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F9FAFB' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
