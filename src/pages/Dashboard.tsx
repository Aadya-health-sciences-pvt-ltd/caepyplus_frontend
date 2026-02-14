import { Search, Settings, MoreHorizontal, FileText, Activity, Pill, Send } from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    return (
        <div className={styles.dashboardContainer}>
            {/* Main Content Area */}
            <div className={styles.mainSection}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <p className={styles.greeting}>Good morning, Monica!</p>
                            <h1 className={styles.title}>How are you today?</h1>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className={styles.searchBar}>
                                <Search size={18} color="#9CA3AF" />
                                <input type="text" placeholder="Search..." className={styles.searchInput} />
                                <span className={styles.shortcut}>⌘ K</span>
                            </div>
                            <button style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', border: '1px solid #E5E7EB', cursor: 'pointer' }}>
                                <Settings size={20} color="#374151" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Medicine Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Your daily medicine</h2>
                        <button className={styles.addButton}>Add medicine</button>
                    </div>

                    <div className={styles.medicineGrid}>
                        {['Tue 9', 'Wed 10', 'Thu 11', 'Fri 12', 'Sat 13', 'Sun 14', 'Mon 15'].map(day => (
                            <div key={day} className={styles.dayHeader}>{day}</div>
                        ))}
                    </div>

                    <div className={styles.medicineRow}>
                        <span className={styles.medicineName}>Metformin 500mg</span>
                        <div className={styles.medicineTimeline}>
                            <div className={styles.dosePill} style={{ left: '60%' }}>
                                <Pill size={12} /> 1
                            </div>
                        </div>
                    </div>
                    <div className={styles.medicineRow}>
                        <span className={styles.medicineName}>Lisinopril 10mg</span>
                        <div className={styles.medicineTimeline}>
                            <div className={`${styles.dosePill} ${styles.orange}`} style={{ left: '20%' }}>
                                <Pill size={12} /> 2
                            </div>
                            <div className={styles.dosePill} style={{ left: '40%' }}>
                                <Pill size={12} /> 1
                            </div>
                        </div>
                    </div>
                    <div className={styles.medicineRow}>
                        <span className={styles.medicineName}>Atorvastatin 20mg</span>
                        <div className={styles.medicineTimeline}>
                            <div className={`${styles.dosePill} ${styles.orange}`} style={{ left: '70%' }}>
                                <Pill size={12} /> 2
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Widgets */}
                <div className={styles.bottomGrid}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.cardTitle}>Schedule</h3>
                            <MoreHorizontal size={16} color="#9CA3AF" />
                        </div>
                        {/* Mock Schedule placeholders */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
                                <div style={{ width: '40px', color: '#6B7280' }}>10:00</div>
                                <div style={{ flex: 1, background: '#EFF6FF', padding: '0.5rem', borderRadius: '0.5rem', color: '#1D4ED8', fontSize: '0.75rem' }}>Dentist Appointment</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
                                <div style={{ width: '40px', color: '#6B7280' }}>14:00</div>
                                <div style={{ flex: 1, background: '#F5F3FF', padding: '0.5rem', borderRadius: '0.5rem', color: '#7C3AED', fontSize: '0.75rem' }}>Gym Session</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.cardTitle}>Billing Status</h3>
                            <MoreHorizontal size={16} color="#9CA3AF" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '120px' }}>
                            {/* CSS Donut Chart Mock */}
                            <div style={{
                                width: '100px', height: '100px', borderRadius: '50%',
                                background: 'conic-gradient(#F59E0B 0% 30%, #10B981 30% 90%, #E5E7EB 90% 100%)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '60px', height: '60px', background: 'white', borderRadius: '50%',
                                    position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', color: '#374151'
                                }}>
                                    12
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }}></div> Pending</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></div> Paid</div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.cardTitle}>Consultations</h3>
                            <MoreHorizontal size={16} color="#9CA3AF" />
                        </div>
                        {/* Bar Chart Mock */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280', width: '40px' }}>Phone</span>
                                <div style={{ height: '8px', width: '40%', background: '#F59E0B', borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280', width: '40px' }}>Video</span>
                                <div style={{ height: '8px', width: '80%', background: '#10B981', borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280', width: '40px' }}>Offline</span>
                                <div style={{ height: '8px', width: '60%', background: '#8B5CF6', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CureAI Sidebar */}
            <div className={styles.chatSidebar}>
                <div className={styles.chatHeader}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <div style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}></div>
                        <div style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}></div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500 }}>
                        CureAI 1.4 <span style={{ background: 'white', color: '#2DD4BF', padding: '0.125rem 0.25rem', borderRadius: '4px', fontSize: '0.65rem' }}>Beta</span>
                    </div>
                    <Settings size={16} />
                </div>

                <div className={styles.visualizer}>
                    <div className={styles.orb}></div>
                    {/* Abstract shape representation */}
                    <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: 'absolute' }}>
                        <path d="M40,100 Q100,20 160,100 T280,100" stroke="white" strokeWidth="0.5" fill="none" opacity="0.5" />
                        <path d="M40,110 Q100,30 160,110 T280,110" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
                        <path d="M40,90 Q100,10 160,90 T280,90" stroke="white" strokeWidth="0.5" fill="none" opacity="0.7" />
                    </svg>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    How can I assist you today?
                </div>

                <div className={styles.chatSuggestions}>
                    <button className={styles.suggestionBtn}>
                        <Activity size={16} />
                        <span>Specialists</span>
                    </button>
                    <button className={styles.suggestionBtn}>
                        <FileText size={16} />
                        <span>Med. History</span>
                    </button>
                    <button className={styles.suggestionBtn}>
                        <FileText size={16} />
                        <span>Health report</span>
                    </button>
                    <button className={styles.suggestionBtn}>
                        <Pill size={16} />
                        <span>Prescriptions</span>
                    </button>
                </div>

                <div className={styles.chatInput}>
                    <input type="text" placeholder="Ask anything..." />
                    <Send size={16} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
