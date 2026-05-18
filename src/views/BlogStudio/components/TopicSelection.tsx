import React, { useState, useEffect } from 'react';
import styles from '../BlogStudio.module.css';

import { doctorService, BlogTopic } from '../../../services/doctorService';

interface TopicSelectionProps {
  onNext: (topicTitle: string) => void;
  initialTopic: string;
  onBack?: () => void;
}

export default function TopicSelection({ onNext, initialTopic, onBack }: TopicSelectionProps) {
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [customTopic, setCustomTopic] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch AI suggested topics
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await doctorService.getBlogTopics();
        setTopics(data.topics);
      } catch (err: any) {
        console.error("Failed to fetch topics:", err);
        setError("Failed to generate AI topics. Please try again or suggest your own.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleNext = () => {
    if (customTopic.trim()) {
      onNext(customTopic.trim());
    } else if (selectedTopic) {
      onNext(selectedTopic);
    }
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.scrollArea}>
        <div className={styles.greetingCard}>
          <h2>Hi Doctor, let&apos;s do something amazing.</h2>
          <p>Your next patient is already searching for you. Your Practice Hub reaches patients 24/7. A blog today = trust built tomorrow.</p>
        </div>

        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          AI-SUGGESTED FOR YOU TODAY
        </h3>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(41, 57, 145, 0.02)', borderRadius: '1.25rem', border: '1px dashed var(--border-color)', marginBottom: '2rem' }}>
            <div className={styles.pulseAnimation}>✦</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.95rem' }}>Analyzing current health trends & generating personalized topics...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error-color)', background: '#FFF5F5', borderRadius: '12px', border: '1px solid #FED7D7', marginBottom: '2rem' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.topicsGrid}>
            {topics.map((topic, i) => (
              <div
                key={i}
                className={`${styles.topicCard} ${selectedTopic === topic.title ? styles.selected : ''}`}
                onClick={() => {
                  setSelectedTopic(topic.title);
                  setCustomTopic('');
                }}
              >
                <span className={styles.topicTag}>{topic.tag}</span>
                <div className={styles.topicTitle}>{topic.title}</div>
                <div className={styles.topicReasoning}>{topic.reasoning}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '1rem 0 2rem', color: 'var(--text-secondary)', position: 'relative' }}>
          <span style={{ backgroundColor: 'white', padding: '0 1.5rem', position: 'relative', zIndex: 1, fontSize: '0.85rem', fontWeight: 600 }}>or suggest your own</span>
          <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)', borderBottom: 'none' }} />
        </div>

        <div className={styles.suggestInputWrapper}>
          <input
            type="text"
            className={styles.suggestInput}
            placeholder="E.g. 'fertility after 35' or 'IVF myths'"
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setSelectedTopic('');
            }}
          />
          <button className={styles.btnSuggest} onClick={handleNext}>
            ✦ AI explain
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        {onBack ? (
          <button className={styles.btnBack} onClick={onBack}>← Back to Studio Hub</button>
        ) : (
          <div style={{ flex: 1 }}></div>
        )}
        <button
          className={styles.btnNext}
          onClick={handleNext}
          disabled={!selectedTopic && !customTopic.trim()}
        >
          Choose keywords →
        </button>
      </div>
    </div>
  );
}
