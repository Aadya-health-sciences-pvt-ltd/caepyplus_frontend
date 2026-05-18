export const isBrowser = (): boolean => {
    try {
        if (typeof window === 'undefined') return false;
        if (typeof window.document === 'undefined') return false;
        if (typeof window.localStorage === 'undefined') return false;
        if (typeof window.localStorage.getItem !== 'function') return false;
        return true;
    } catch {
        return false;
    }
};
