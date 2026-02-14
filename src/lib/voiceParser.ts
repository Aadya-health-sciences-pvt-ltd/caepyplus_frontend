
interface ParsedResult {
    field: string;
    value: string;
}

// Simple keyword mapping for prototype
// In production, this would likely use an LLM or more robust NLP
export const parseVoiceInput = (transcript: string, currentStep: number): ParsedResult | null => {
    const text = transcript.toLowerCase();

    // Mapping logic based on current step context
    switch (currentStep) {
        case 1: // Professional Identity
            if (text.includes('name is') || text.includes('i am')) {
                const value = extractValue(text, ['name is', 'i am', 'this is']);
                return { field: 'fullName', value };
            }
            if (text.includes('specialty is') || text.includes('specialise in') || text.includes('specialize in')) {
                const value = extractValue(text, ['specialty is', 'specialise in', 'specialize in', 'i am a']);
                return { field: 'specialty', value }; // Note: specialty usually needs validation against master data
            }
            if (text.includes('located in') || text.includes('practice in') || text.includes('location is')) {
                const value = extractValue(text, ['located in', 'practice in', 'location is']);
                return { field: 'primaryLocation', value };
            }
            if (text.includes('experience') || text.includes('years')) {
                // Extract number
                const match = text.match(/([\d]+)/);
                if (match) return { field: 'experience', value: match[0] };
            }
            break;

        case 2: // Credentials
            if (text.includes('mbbs in') || text.includes('passed mbbs')) {
                const match = text.match(/(\d{4})/); // simple year match
                if (match) return { field: 'mbbsYear', value: match[0] };
            }
            if (text.includes('qualification') || text.includes('degrees')) {
                const value = extractValue(text, ['qualification is', 'degrees are', 'i have done']);
                return { field: 'qualifications', value };
            }
            break;

        case 3: // Clinical Focus
            if (text.includes('interested in') || text.includes('focus on')) {
                const value = extractValue(text, ['interested in', 'focus on', 'areas are']);
                return { field: 'areasOfInterest', value: formatMultiple(value) }; // handling as string for now, will need array conversion in usage
            }
            if (text.includes('treat') || text.includes('conditions')) {
                const value = extractValue(text, ['treat', 'conditions like', 'commonly see']);
                return { field: 'commonConditions', value: formatMultiple(value) };
            }
            break;

        // ... Add more cases as needed for other steps
    }

    // Fallback: If no specific keyword, map to the most likely "main" field of the section or generic handling
    // For now, return null to avoid bad writes
    return null;
};

const extractValue = (text: string, triggers: string[]): string => {
    let result = text;
    triggers.forEach(trigger => {
        if (result.includes(trigger)) {
            result = result.split(trigger)[1];
        }
    });
    // Clean up
    return result.trim().replace(/[.,!]$/, ''); // remove trailing punctuation
};

const formatMultiple = (text: string): string => {
    // Basic comma separation attempt
    return text.replace(/ and /g, ', ');
};
