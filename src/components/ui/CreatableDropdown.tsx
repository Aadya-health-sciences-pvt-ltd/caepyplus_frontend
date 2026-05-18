'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { dropdownService } from '../../services/dropdownService';
import styles from './CreatableDropdown.module.css';

export interface DropdownOption {
    value: string;
    label: string;
}

interface CreatableDropdownProps {
    name: string;
    value: string;
    options: DropdownOption[];
    fieldName: string; // Backend field_name for API calls
    placeholder?: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onOptionAdded?: (option: DropdownOption) => void; // Callback when a new option is added
    className?: string;
}

const CreatableDropdown: React.FC<CreatableDropdownProps> = ({
    name,
    value,
    options,
    fieldName,
    placeholder = 'Select or type...',
    onChange,
    onFocus,
    onOptionAdded,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Derive display text from value
    const displayLabel = options.find(o => o.value === value)?.label || value || '';

    // Filter options based on search text
    const filteredOptions = searchText.trim()
        ? options.filter(o =>
            o.label.toLowerCase().includes(searchText.toLowerCase()) ||
            o.value.toLowerCase().includes(searchText.toLowerCase())
        )
        : options;

    // Check if typed text is a new value (not already in options)
    const trimmedSearch = searchText.trim();
    const isExactMatch = options.some(
        o => o.value.toLowerCase() === trimmedSearch.toLowerCase() ||
            o.label.toLowerCase() === trimmedSearch.toLowerCase()
    );
    const showAddOption = trimmedSearch.length > 0 && !isExactMatch;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                // Reset search text to current value display
                setSearchText('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-option]');
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    const handleSelect = useCallback((optionValue: string) => {
        onChange(optionValue);
        setSearchText('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    }, [onChange]);

    const handleAddNew = useCallback(async () => {
        if (!trimmedSearch || isSubmitting) return;

        setIsSubmitting(true);
        const success = await dropdownService.submitDropdownValue(fieldName, trimmedSearch, trimmedSearch);
        setIsSubmitting(false);

        if (success) {
            // Select the new value
            onChange(trimmedSearch);
            // Notify parent to add to local options
            onOptionAdded?.({ value: trimmedSearch, label: trimmedSearch });
        }

        setSearchText('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    }, [trimmedSearch, isSubmitting, fieldName, onChange, onOptionAdded]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        const totalItems = filteredOptions.length + (showAddOption ? 1 : 0);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % totalItems);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                } else if (showAddOption && highlightedIndex === filteredOptions.length) {
                    handleAddNew();
                } else if (showAddOption && highlightedIndex === -1) {
                    // If nothing highlighted but there's an add option, add it
                    handleAddNew();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchText('');
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setHighlightedIndex(-1);
        if (!isOpen) setIsOpen(true);
    };

    const handleFocus = () => {
        // Keep focus tracking for parent but avoid auto-opening,
        // so programmatic focus (like on step change) doesn't open the menu.
        onFocus?.();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchText('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <input
                ref={inputRef}
                name={name}
                type="text"
                autoComplete="off"
                value={isOpen ? searchText : displayLabel}
                placeholder={placeholder}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onClick={() => setIsOpen(prev => !prev)}
                onKeyDown={handleKeyDown}
                className={`${styles.input} ${isOpen ? styles.inputOpen : ''} ${className || ''}`}
                style={value && !isOpen ? { paddingRight: '2.25rem' } : {}}
            />
            {value && !isOpen && (
                <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleClear}
                    title="Clear"
                >
                    ✕
                </button>
            )}

            {isOpen && (
                <div className={`${styles.dropdown} ${isSubmitting ? styles.submitting : ''}`} ref={listRef}>
                    {filteredOptions.map((option, index) => (
                        <div
                            key={option.value}
                            data-option
                            className={`${styles.option} ${highlightedIndex === index ? styles.optionHighlighted : ''
                                } ${value === option.value ? styles.optionSelected : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(option.value);
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {option.label}
                        </div>
                    ))}

                    {showAddOption && (
                        <div
                            data-option
                            className={styles.addOption}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleAddNew();
                            }}
                            onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                        >
                            <span className={styles.addIcon}>+</span>
                            Add "{trimmedSearch}"
                        </div>
                    )}

                    {filteredOptions.length === 0 && !showAddOption && (
                        <div className={styles.noResults}>No options found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreatableDropdown;
