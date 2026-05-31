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
    /** Used when submitting a user-typed value to the dropdown API; ignored when `creatable` is false. */
    fieldName: string;
    placeholder?: string;
    onChange: (values: string[]) => void;
    onFocus?: () => void;
    onOptionAdded?: (option: DropdownOption) => void;
    className?: string;
    /** When false, only predefined `options` can be chosen (no “Add …” / API create). Default true. */
    creatable?: boolean;
}

/** Window to treat a second pointer down on the same control as double-click (cancel action). */
const DOUBLE_CLICK_PAIR_MS = 450;

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
    creatable = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef(values);
    valuesRef.current = values;

    const armedActionRef = useRef<{ actionKey: string; at: number } | null>(null);

    const cancelArmedAction = useCallback(() => {
        armedActionRef.current = null;
    }, []);

    /**
     * Run action on the next tick unless a second pointer down (double-click) disarms it first.
     * Single click: immediate. Double-click: both mousedowns arrive before timeout → no toggle.
     */
    const runProtectedPointerAction = useCallback((actionKey: string, action: () => void) => {
        const now = Date.now();
        const armed = armedActionRef.current;
        if (armed?.actionKey === actionKey && now - armed.at < DOUBLE_CLICK_PAIR_MS) {
            armedActionRef.current = null;
            return;
        }
        armedActionRef.current = { actionKey, at: now };
        setTimeout(() => {
            if (armedActionRef.current?.actionKey !== actionKey) return;
            armedActionRef.current = null;
            action();
        }, 0);
    }, []);

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
    const showAddOption = creatable && trimmedSearch.length > 0 && !isExactMatch;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                cancelArmedAction();
                setIsOpen(false);
                setSearchText('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [cancelArmedAction]);

    useEffect(() => () => cancelArmedAction(), [cancelArmedAction]);

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
            const current = valuesRef.current;
            const next = current.includes(v)
                ? current.filter(x => x !== v)
                : [...current, v];
            valuesRef.current = next;
            onChange(next);
            setSearchText('');
            setIsOpen(false);
            setHighlightedIndex(-1);
        },
        [onChange],
    );

    const handleAddNew = useCallback(async () => {
        if (!trimmedSearch || isSubmitting) return;

        setIsSubmitting(true);
        const success = await dropdownService.submitDropdownValue(fieldName, trimmedSearch, trimmedSearch);
        setIsSubmitting(false);

        if (success) {
            const v = trimmedSearch.trim();
            const current = valuesRef.current;
            if (!current.includes(v)) {
                const next = [...current, v];
                valuesRef.current = next;
                onChange(next);
            }
            onOptionAdded?.({ value: v, label: v });
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
                    toggleValue(filteredOptions[highlightedIndex].value);
                } else if (showAddOption && highlightedIndex === filteredOptions.length) {
                    void handleAddNew();
                } else if (showAddOption && highlightedIndex === -1) {
                    void handleAddNew();
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

    const handlePointerSelect = useCallback(
        (actionKey: string, action: () => void) => (e: React.MouseEvent) => {
            e.preventDefault();
            if (e.detail > 1) {
                cancelArmedAction();
                return;
            }
            runProtectedPointerAction(actionKey, action);
        },
        [cancelArmedAction, runProtectedPointerAction],
    );

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        valuesRef.current = [];
        onChange([]);
        setSearchText('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeChip = (v: string) => {
        const next = valuesRef.current.filter(x => x !== v);
        valuesRef.current = next;
        onChange(next);
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
                                onMouseDown={e => e.stopPropagation()}
                                onClick={e => {
                                    e.stopPropagation();
                                    removeChip(v);
                                }}
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
                    onFocus={() => {
                        onFocus?.();
                        setIsOpen(true);
                    }}
                    onMouseDown={e => {
                        if (e.detail > 1) e.preventDefault();
                    }}
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
                            onMouseDown={handlePointerSelect(`opt:${option.value}`, () =>
                                toggleValue(option.value),
                            )}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {option.label}
                        </div>
                    ))}

                    {showAddOption && (
                        <div
                            data-option
                            className={styles.addOption}
                            onMouseDown={handlePointerSelect(`add:${trimmedSearch}`, () => {
                                void handleAddNew();
                            })}
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
