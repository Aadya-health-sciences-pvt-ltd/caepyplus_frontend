/**
 * Fellowships in onboarding are edited as one text field and stored as string[].
 *
 * Use comma-only joining: `parts.join(',')` — never `join(', ')`.
 * `split(',')` keeps the character after a comma on the next segment (e.g. `"A, B"` → `["A", " B"]`).
 * If the UI then used `join(', ')`, that adds another space after the comma → `"A,  B"` and spaces grow each edit.
 */

export function fellowshipsFromCommaList(value: string): string[] {
    if (value === '') return [];
    return value.split(',');
}

export function fellowshipsToCommaList(parts: string[] | null | undefined): string {
    if (!parts?.length) return '';
    return parts.join(',');
}
