import React, { useState, useEffect } from 'react';
import styles from '../BlogStudio.module.css';
import { doctorService } from '../../../services/doctorService';

interface KeywordSelectionProps {
  topic: string;
  initialKeywords: string[];
  onNext: (keywords: string[]) => void;
  onBack: () => void;
}

export default function KeywordSelection({ topic, initialKeywords, onNext, onBack }: KeywordSelectionProps) {
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(initialKeywords);
  const [customKeyword, setCustomKeyword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeywords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await doctorService.getBlogKeywords(topic);
        setSuggestedKeywords(data.keywords);
      } catch (err: any) {
        console.error("Failed to fetch keywords:", err);
        setError("Failed to generate AI keywords. Please add your own.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (topic) {
      fetchKeywords();
    }
  }, [topic]);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const handleAddCustom = () => {
    if (customKeyword.trim() && !selectedKeywords.includes(customKeyword.trim())) {
      setSelectedKeywords(prev => [...prev, customKeyword.trim()]);
      setCustomKeyword('');
    }
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.scrollArea}>
        <div style={{ padding: '1.25rem 1.75rem', backgroundColor: '#F8FAFC', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Selected topic</p>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)' }}>{topic}</h3>
          </div>
          <div style={{ fontSize: '1.5rem', opacity: 0.3 }}>📝</div>
        </div>

        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
          AI-SUGGESTED KEYWORDS — PICK 4 TO 6
        </h4>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'rgba(41, 57, 145, 0.02)', borderRadius: '1.25rem', border: '1px dashed var(--border-color)', marginBottom: '2rem' }}>
            <div className={styles.pulseAnimation}>✦</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.95rem' }}>Analyzing topic and finding the best SEO keywords...</p>
          </div>
        ) : error && suggestedKeywords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error-color)', background: '#FFF5F5', borderRadius: '12px', border: '1px solid #FED7D7', marginBottom: '2rem' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {suggestedKeywords.map(kw => {
              const isSelected = selectedKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  onClick={() => toggleKeyword(kw)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '9999px',
                    border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    backgroundColor: isSelected ? 'rgba(41, 57, 145, 0.05)' : 'white',
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-color)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isSelected ? 'var(--primary-color)' : '#D1D5DB' }} />
                  {kw}
                </button>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedKeywords.length >= 4 ? 'var(--primary-color)' : 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          {selectedKeywords.length} selected · {selectedKeywords.length < 4 ? 'Try to pick at least 4' : 'Good for SEO focus'}
        </p>

        <div style={{ textAlign: 'center', margin: '1rem 0 2rem', color: 'var(--text-secondary)', position: 'relative' }}>
          <span style={{ backgroundColor: 'white', padding: '0 1.5rem', position: 'relative', zIndex: 1, fontSize: '0.85rem', fontWeight: 600 }}>add your own</span>
          <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)', borderBottom: 'none' }} />
        </div>

        <div className={styles.suggestInputWrapper}>
          <input 
            type="text"
            className={styles.suggestInput}
            placeholder="Type a keyword..."
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          />
          <button 
            className={styles.btnSuggest}
            onClick={handleAddCustom}
          >
            + Add
          </button>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(26, 191, 210, 0.05)', borderLeft: '4px solid #1ABFD2', borderRadius: '0 1rem 1rem 0', marginTop: '2rem' }}>
          <h5 style={{ color: '#1499A8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💡</span> SEO insight
          </h5>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            These keywords target patients searching locally. Adding location-based keywords will also boost 
            your Practice Hub local ranking and trust.
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <button className={styles.btnBack} onClick={onBack}>← Back</button>
          <button 
            className={styles.btnNext} 
            onClick={() => onNext(selectedKeywords)}
            disabled={selectedKeywords.length === 0}
          >
            Write the blog →
          </button>
        </div>
      </div>
    </div>
  );
}
