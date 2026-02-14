import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Database, RefreshCw, Save } from 'lucide-react';
import { getMasterData, addMasterItem, removeMasterItem, resetMasterData, type MasterData } from '../../lib/masterData';

const AdminMasters = () => {
    const [data, setData] = useState<MasterData | null>(null);
    const [activeTab, setActiveTab] = useState<keyof MasterData>('specialties');
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setData(getMasterData());
    };

    const handleAdd = () => {
        if (!newItem.trim()) return;
        const updated = addMasterItem(activeTab, newItem.trim());
        setData(updated);
        setNewItem('');
    };

    const handleDelete = (item: string) => {
        if (window.confirm(`Are you sure you want to delete "${item}"?`)) {
            const updated = removeMasterItem(activeTab, item);
            setData(updated);
        }
    };

    const handleReset = () => {
        if (window.confirm("Reset all master data to defaults? This cannot be undone.")) {
            const defaults = resetMasterData();
            setData(defaults);
        }
    };

    if (!data) return <div>Loading...</div>;

    const tabs: { key: keyof MasterData; label: string }[] = [
        { key: 'specialties', label: 'Specialties' },
        { key: 'locations', label: 'Locations' },
        { key: 'practiceSegments', label: 'Practice Segments' },
        { key: 'commonConditions', label: 'Conditions' }
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Master Data Management</h1>
                    <p style={{ color: '#6B7280' }}>Manage dropdown options for the Onboarding flow.</p>
                </div>
                <button
                    onClick={handleReset}
                    style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'center',
                        padding: '0.5rem 1rem', border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem', background: 'white', color: '#6B7280', cursor: 'pointer'
                    }}
                >
                    <RefreshCw size={16} /> Reset Defaults
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderBottom: activeTab === tab.key ? '2px solid #0EA5E9' : '2px solid transparent',
                            color: activeTab === tab.key ? '#0EA5E9' : '#6B7280',
                            fontWeight: activeTab === tab.key ? 600 : 500,
                            background: 'none',
                            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Add New */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '500px' }}>
                <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`Add new ${tabs.find(t => t.key === activeTab)?.label.slice(0, -1)}...`}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                        border: '1px solid #D1D5DB', outline: 'none'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button
                    onClick={handleAdd}
                    disabled={!newItem.trim()}
                    style={{
                        background: newItem.trim() ? '#0EA5E9' : '#E5E7EB',
                        color: 'white', border: 'none', borderRadius: '0.5rem',
                        padding: '0 1.5rem', cursor: newItem.trim() ? 'pointer' : 'not-allowed',
                        fontWeight: 500
                    }}
                >
                    Add
                </button>
            </div>

            {/* List */}
            <div style={{
                background: 'white', borderRadius: '0.75rem',
                border: '1px solid #E5E7EB', maxWidth: '800px',
                overflow: 'hidden'
            }}>
                {data[activeTab].length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                        No items found. Add one above.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Value</th>
                                <th style={{ textAlign: 'right', padding: '1rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data[activeTab].map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '1rem', color: '#111827' }}>{item}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminMasters;
