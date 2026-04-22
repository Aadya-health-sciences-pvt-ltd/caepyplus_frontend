'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { dropdownService } from '../../services/dropdownService';
import type { DropdownOption } from './CreatableDropdown';
import styles from './CreatableMultiSelect.module.css';

export type { DropdownOption };

interface CreatableMultiSelectProps {
    name: string;
    values: string[];
    options: DropdownOption[];
    fieldName: string;
    placeholder?: string;
    onChange: (values: string[]) => void;
    onFocus?: () => void;
    onOptionAdded?: (option: DropdownOption) => void;
    className?: string;
}

const CreatableMultiSelect: React.FC<CreatableMultiSelectProps> = ({
    name,
    values,
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

    const filteredOptions = searchText.trim()
        ? options.filter(
              o =>
                  o.label.toLowerCase().includes(searchText.toLowerCase()) ||
                  o.value.toLowerCase().includes(searchText.toLowerCase()),
          )
        : options;

    const trimmedSearch = searchText.trim();
    const isExactMatch = options.some(
        o =>
            o.value.toLowerCase() === trimmedSearch.toLowerCase() ||
            o.label.toLowerCase() === trimmedSearch.toLowerCase(),
    );
    const showAddOption = trimmedSearch.length > 0 && !isExactMatch;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchText('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-option]');
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    const toggleValue = useCallback(
        (optionValue: string) => {
            const v = optionValue.trim();
            if (!v) return;
            if (values.includes(v)) {
                onChange(values.filter(x => x !== v));
            } else {
                onChange([...values, v]);
            }
            setSearchText('');
            setIsOpen(false);
            setHighlightedIndex(-1);
        },
        [onChange, values],
    );

    const handleAddNew = useCallback(async () => {
        if (!trimmedSearch || isSubmitting) return;

        setIsSubmitting(true);
        const success = await dropdownService.submitDropdownValue(fieldName, trimmedSearch, trimmedSearch);
        setIsSubmitting(false);

        if (success) {
            const v = trimmedSearch.trim();
            if (!values.includes(v)) {
                onChange([...values, v]);
            }
            onOptionAdded?.({ value: v, label: v });
        }

        setSearchText('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    }, [trimmedSearch, isSubmitting, fieldName, onChange, onOptionAdded, values]);

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
                    toggleValue(filteredOptions[highlightedIndex].value);
                } else if (showAddOption && highlightedIndex === filteredOptions.length) {
                    handleAddNew();
                } else if (showAddOption && highlightedIndex === -1) {
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
        onFocus?.();
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
        setSearchText('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeChip = (v: string) => {
        onChange(values.filter(x => x !== v));
    };

    const showClear = values.length > 0 && !isOpen;

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            {values.length > 0 && (
                <div className={styles.chips}>
                    {values.map(v => (
                        <span key={v} className={styles.chip}>
                            <span className={styles.chipLabel}>{v}</span>
                            <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => removeChip(v)}
                                aria-label={`Remove ${v}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className={styles.inputRow}>
                <input
                    ref={inputRef}
                    name={name}
                    type="text"
                    autoComplete="off"
                    value={isOpen ? searchText : ''}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onClick={() => setIsOpen(prev => !prev)}
                    onKeyDown={handleKeyDown}
                    className={`${styles.input} ${isOpen ? styles.inputOpen : ''} ${className || ''}`}
                    style={showClear ? { paddingRight: '2.25rem' } : {}}
                />
                {showClear && (
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={handleClearAll}
                        title="Clear all"
                    >
                        {'\u2715'}
                    </button>
                )}
            </div>

            {isOpen && (
                <div className={`${styles.dropdown} ${isSubmitting ? styles.submitting : ''}`} ref={listRef}>
                    {filteredOptions.map((option, index) => (
                        <div
                            key={option.value}
                            data-option
                            className={`${styles.option} ${
                                highlightedIndex === index ? styles.optionHighlighted : ''
                            } ${values.includes(option.value) ? styles.optionSelected : ''}`}
                            onMouseDown={e => {
                                e.preventDefault();
                                toggleValue(option.value);
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
                            onMouseDown={e => {
                                e.preventDefault();
                                handleAddNew();
                            }}
                            onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                        >
                            <span className={styles.addIcon}>+</span>
                            Add &quot;{trimmedSearch}&quot;
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

export default CreatableMultiSelect;
