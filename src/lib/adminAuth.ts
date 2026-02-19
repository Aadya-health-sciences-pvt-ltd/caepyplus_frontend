export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'operation';
    joinedDate: string;
}

const STORAGE_KEY = 'caepy_admin_users';

const DEFAULT_ADMINS: AdminUser[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@caepy.com',
        role: 'admin',
        joinedDate: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Operations User',
        email: 'ops@caepy.com',
        role: 'operation',
        joinedDate: new Date().toISOString()
    }
];

export const initializeAdminData = () => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADMINS));
    }
};

export const getAdminUsers = (): AdminUser[] => {
    initializeAdminData();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const addAdminUser = (user: Omit<AdminUser, 'id' | 'joinedDate'>) => {
    const users = getAdminUsers();
    const newUser: AdminUser = {
        ...user,
        id: Date.now().toString(),
        joinedDate: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
};

export const updateAdminUser = (id: string, updates: Partial<Omit<AdminUser, 'id' | 'joinedDate'>>) => {
    const users = getAdminUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users[index];
    }
    return null;
};

export const getCurrentUserRole = (email: string): 'admin' | 'operation' | null => {
    const users = getAdminUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return found ? found.role : null;
};

// Helper to simulate "current logged in user" since we don't have full auth yet
export const getLoggedInAdmin = (): AdminUser | null => {
    const email = localStorage.getItem('caepy_logged_in_email');
    if (!email) return null;

    if (email.startsWith('phone:')) {
        return {
            id: 'phone-admin',
            name: 'Admin User',
            email: email,
            role: (localStorage.getItem('role') as 'admin' | 'operation') || 'admin',
            joinedDate: new Date().toISOString()
        };
    }

    const users = getAdminUsers();
    return users.find(u => u.email === email) || null;
};

export const setLoggedInAdmin = (email: string) => {
    localStorage.setItem('caepy_logged_in_email', email);
};

export const logoutAdmin = () => {
    localStorage.removeItem('caepy_logged_in_email');
};
