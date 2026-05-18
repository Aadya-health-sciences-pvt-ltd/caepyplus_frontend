'use client';

import React, { useState, useEffect } from 'react';
import styles from './CommentModerationView.module.css';
import { doctorService } from '../../services/doctorService';

interface Comment {
  id: number;
  blog_id: number;
  author_name: string;
  author_type: 'PATIENT' | 'ANONYMOUS' | 'SUSPICIOUS';
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  ai_insight: string;
  created_at: string;
}

export default function CommentModerationView() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getComments();
      // Backend returns lowercase statuses, map them to uppercase if needed or handle accordingly
      const mapped = data.map(c => ({
        ...c,
        status: c.status.toUpperCase() as any,
        author_type: c.author_type.toUpperCase() as any
      }));
      setComments(mapped);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await doctorService.updateCommentStatus(id, status.toLowerCase() as any);
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update comment status");
    }
  };

  const filteredComments = comments.filter(c => c.status === activeTab);

  const pendingCount = comments.filter(c => c.status === 'PENDING').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Comment Moderation</h1>
        <p className={styles.subtitle}>Review what patients are saying on your Practice Hub blogs.</p>
      </div>

      <div className={styles.tabs}>
        <div 
          className={`${styles.tab} ${activeTab === 'PENDING' ? styles.active : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending {pendingCount > 0 && <span style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{pendingCount}</span>}
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'APPROVED' ? styles.active : ''}`}
          onClick={() => setActiveTab('APPROVED')}
        >
          Approved
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'REJECTED' ? styles.active : ''}`}
          onClick={() => setActiveTab('REJECTED')}
        >
          Rejected / Spam
        </div>
      </div>

      <div className={styles.commentsList}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className={styles.spinner} style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>✓</div>
            <h3>All caught up</h3>
            <p>No {activeTab.toLowerCase()} comments to display.</p>
          </div>
        ) : (
          filteredComments.map(comment => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div className={styles.authorInfo}>
                  <div className={styles.authorAvatar}>
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.authorName}>{comment.author_name}</div>
                    <div className={styles.postInfo}>Comment on your latest blog post</div>
                  </div>
                </div>
                {activeTab === 'PENDING' && (
                  <div className={styles.actionButtons}>
                    <button className={styles.btnApprove} onClick={() => handleAction(comment.id, 'APPROVED')}>
                      ✓ Approve
                    </button>
                    <button className={styles.btnReject} onClick={() => handleAction(comment.id, 'REJECTED')}>
                      ✕ Reject
                    </button>
                  </div>
                )}
                {activeTab !== 'PENDING' && (
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: activeTab === 'APPROVED' ? 'var(--success-color)' : 'var(--error-color)' }}>
                    {activeTab}
                  </span>
                )}
              </div>
              
              <div className={styles.commentContent}>
                {comment.content}
              </div>
              
              <div className={`${styles.aiInsight} ${comment.author_type === 'SUSPICIOUS' ? styles.danger : ''}`}>
                {comment.ai_insight || '✦ AI insight: Analyzed by Gemini'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
