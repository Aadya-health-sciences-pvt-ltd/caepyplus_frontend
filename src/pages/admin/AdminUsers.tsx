import React, { useState, useEffect } from 'react';
import {
    Users, Shield, Plus, CheckCircle, Edit
} from 'lucide-react';
import { getAdminUsers, addAdminUser, updateAdminUser, getLoggedInAdmin, type AdminUser } from '../../lib/adminAuth';

const AdminUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', role: 'operation' as const });

    useEffect(() => {
        setUsers(getAdminUsers());
        setCurrentUser(getLoggedInAdmin());
    }, []);

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'operation' });
        setIsModalOpen(true);
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            updateAdminUser(editingUser.id, formData);
        } else {
            addAdminUser(formData);
        }

        setUsers(getAdminUsers()); // Refresh list
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'operation' }); // Reset form
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>User Management</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>Manage access roles for the Admin Console.</p>
                </div>

                {currentUser?.role === 'admin' && (
                    <button
                        onClick={openAddModal}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: '#2563EB', color: 'white', border: 'none',
                            padding: '0.75rem 1rem', borderRadius: '0.5rem',
                            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
                        }}
                    >
                        <Plus size={16} /> Add User
                    </button>
                )}
            </div>

            {/* Users Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>User</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Role</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Description</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Date Added</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Status</th>
                            {currentUser?.role === 'admin' && <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 500, color: '#6B7280' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#111827' }}>{user.name}</div>
                                            <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                        padding: '0.25rem 0.625rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500,
                                        background: user.role === 'admin' ? '#FEF3C7' : '#E0F2FE',
                                        color: user.role === 'admin' ? '#92400E' : '#0369A1'
                                    }}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                                        {user.role === 'admin' ? 'Admin' : 'Operation'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#6B7280' }}>
                                    {user.role === 'admin'
                                        ? 'Full access to all features and user management.'
                                        : 'Access to operational dashboards and doctor lists.'}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#6B7280' }}>
                                    {new Date(user.joinedDate).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.75rem', fontWeight: 500 }}>
                                        <CheckCircle size={14} /> Active
                                    </span>
                                </td>
                                {currentUser?.role === 'admin' && (
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            style={{
                                                background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '6px',
                                                padding: '0.4rem', cursor: 'pointer', color: '#4B5563', transition: 'all 0.2s',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Edit User"
                                        >
                                            <Edit size={14} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit User Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                                <input
                                    type="email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    placeholder="e.g. jane@caepy.com"
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'operation' })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', background: 'white' }}
                                >
                                    <option value="operation">Operation</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#2563EB', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                                >
                                    {editingUser ? 'Save Changes' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
