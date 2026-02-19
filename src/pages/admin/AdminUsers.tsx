import React, { useState, useEffect } from 'react';
import {
    Users, Shield, Plus, CheckCircle, Edit, XCircle, Smartphone, Mail, Save
} from 'lucide-react';
import { adminService, type AdminUserResponse, type CreateUserPayload, type UpdateUserPayload } from '../../services/adminService';

const AdminUsers = () => {
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'operation'>('operation');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);

    // Form State
    const [formData, setFormData] = useState<CreateUserPayload & { id?: number }>({
        phone: '',
        email: '',
        role: 'operation',
        is_active: true,
        doctor_id: null
    });

    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        // Determine current user role from localStorage
        const storedRole = localStorage.getItem('role') as 'admin' | 'operation';
        setCurrentUserRole(storedRole || 'operation');

        fetchUsers();
    }, [page]); // Re-fetch on page change

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Filter only valid admin/op users
            const data = await adminService.getUsers(page, 20, ['admin', 'operation']);
            if (data && data.users) {
                setUsers(data.users);
                setTotalUsers(data.total);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({
            phone: '',
            email: '',
            role: 'operation',
            is_active: true,
            doctor_id: null
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user: AdminUserResponse) => {
        setEditingUser(user);
        setFormData({
            id: user.id,
            phone: user.phone,
            email: user.email || '',
            role: user.role as 'admin' | 'operation', // Ensure type match
            is_active: user.is_active,
            doctor_id: user.doctor_id
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUser) {
                // Update
                const payload: UpdateUserPayload = {
                    email: formData.email || null,
                    role: formData.role,
                    is_active: formData.is_active,
                    doctor_id: formData.doctor_id || null
                };
                // Note: Phone usually cannot be changed in simple update unless backend allows.
                // The prompt example for PATCH only showed email, role, is_active, doctor_id.

                await adminService.updateUser(editingUser.id, payload);
            } else {
                // Create
                const payload: CreateUserPayload = {
                    phone: formData.phone,
                    email: formData.email || null,
                    role: formData.role,
                    is_active: formData.is_active,
                    doctor_id: formData.doctor_id || null
                };
                await adminService.createUser(payload);
            }

            fetchUsers();
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('Failed to save user. Please check the inputs and try again.');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>User Management</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>Manage access roles and users for the Admin Console.</p>
                </div>

                {currentUserRole === 'admin' && (
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
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Loading users...</div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>User</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Role</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Created At</th>
                                    {currentUserRole === 'admin' && <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 500, color: '#6B7280' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {user.email ? user.email.charAt(0).toUpperCase() : user.phone.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Smartphone size={12} /> {user.phone}
                                                    </div>
                                                    {user.email && (
                                                        <div style={{ color: '#6B7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Mail size={12} /> {user.email}
                                                        </div>
                                                    )}
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
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 500,
                                                color: user.is_active ? '#059669' : '#DC2626'
                                            }}>
                                                {user.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.75rem' }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        {currentUserRole === 'admin' && (
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
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {/* Pagination Footer */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid #E5E7EB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#F9FAFB',
                            fontSize: '0.875rem',
                            color: '#6B7280'
                        }}>
                            <div>
                                Showing <span style={{ fontWeight: 600, color: '#111827' }}>{(page - 1) * 20 + 1}</span> to <span style={{ fontWeight: 600, color: '#111827' }}>{Math.min(page * 20, totalUsers)}</span> of <span style={{ fontWeight: 600, color: '#111827' }}>{totalUsers}</span> entries
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.375rem',
                                        background: page === 1 ? '#F3F4F6' : 'white',
                                        color: page === 1 ? '#9CA3AF' : '#374151',
                                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={users.length < 20}
                                    onClick={() => setPage(p => p + 1)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.375rem',
                                        background: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Phone - Read only in edit mode usually, but depends on API. Assuming create only for now */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Phone Number *</label>
                                <input
                                    type="text" required
                                    disabled={!!editingUser} // Disable in edit mode as primary key often
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                        border: '1px solid #D1D5DB',
                                        backgroundColor: editingUser ? '#F3F4F6' : 'white'
                                    }}
                                    placeholder="e.g. 9876543210"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    placeholder="e.g. user@example.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
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

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ width: '1rem', height: '1rem' }}
                                    />
                                    Active User Account
                                </label>
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
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none',
                                        background: '#2563EB', color: 'white', cursor: 'pointer',
                                        fontSize: '0.875rem', fontWeight: 500
                                    }}
                                >
                                    <Save size={16} />
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
