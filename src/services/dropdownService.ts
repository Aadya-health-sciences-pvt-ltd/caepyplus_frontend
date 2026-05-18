import api from '../lib/api';

export interface DropdownOption {
    value: string;
    label: string;
}

/**
 * Fetch dropdown options for a given field from the backend API.
 * Falls back to an empty array on error.
 */
export const fetchDropdownOptions = async (fieldName: string): Promise<DropdownOption[]> => {
    try {
        const response = await api.get(`/dropdowns/${fieldName}`);
        const data = response.data;

        // Handle different response shapes
        if (Array.isArray(data)) {
            return data.map((item: any) => ({
                value: item.value || item.label || item,
                label: item.label || item.value || item,
            }));
        }

        if (data?.options && Array.isArray(data.options)) {
            return data.options.map((item: any) => ({
                value: item.value || item.label || item,
                label: item.label || item.value || item,
            }));
        }

        return [];
    } catch (error) {
        console.warn(`Failed to fetch dropdown options for "${fieldName}":`, error);
        return [];
    }
};

/**
 * Submit a new dropdown value for admin review.
 */
export const submitDropdownValue = async (
    fieldName: string,
    value: string,
    label?: string
): Promise<boolean> => {
    try {
        await api.post('/dropdowns/submit', {
            field_name: fieldName,
            value,
            label: label || value,
        });
        return true;
    } catch (error) {
        console.error(`Failed to submit dropdown value for "${fieldName}":`, error);
        return false;
    }
};

export const dropdownService = {
    fetchDropdownOptions,
    submitDropdownValue,
};
