'use client';

import React, { useState, useEffect } from 'react';
import BlogStudio from './BlogStudio';
import CommentModerationView from '../CommentModeration/CommentModerationView';
import styles from './BlogStudioHub.module.css';
import { doctorService } from '../../services/doctorService';

type TabType = 'drafts' | 'published' | 'comments';

interface BlogCardData {
  id: number;
  title: string;
  subtitle?: string;
  opening_quote?: string;
  content?: string;
  topic?: string;
  keywords?: string[];
  status: 'DRAFT' | 'PUBLISHED';
  estimated_read_time?: number;
  created_at: string;
  updated_at?: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function BlogStudioHub() {
  const [activeTab, setActiveTab] = useState<TabType>('drafts');
  const [showCreator, setShowCreator] = useState(false);
  const [editingDraft, setEditingDraft] = useState<BlogCardData | null>(null);
  const [blogs, setBlogs] = useState<BlogCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);

  const fetchStudioData = async () => {
    setLoading(true);
    try {
      const [blogsData, commentsData] = await Promise.all([
        doctorService.getBlogs(),
        doctorService.getComments()
      ]);
      
      const mappedBlogs = blogsData.map((b: any) => ({
        ...b,
        keywords: b.keywords?.map((k: any) => typeof k === 'string' ? k : k.keyword) || []
      }));
      setBlogs(mappedBlogs);
      setPendingCommentsCount(commentsData.filter((c: any) => c.status.toLowerCase() === 'pending').length);
    } catch (err) {
      console.error("Failed to fetch studio data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, []);

  const handleBack = () => {
    setShowCreator(false);
    setEditingDraft(null);
    fetchStudioData(); // Refresh list on back to show newly saved changes
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;
    
    try {
      await doctorService.deleteBlog(blogId);
      fetchStudioData(); // Refresh list
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Failed to delete blog. Please try again.");
    }
  };

  if (showCreator || editingDraft) {
    return (
      <div>
        {editingDraft ? (
          <BlogStudio
            initialStep={4}
            onBackToHub={handleBack}
            initialData={{
              id: editingDraft.id,
              topic: editingDraft.topic || '',
              keywords: editingDraft.keywords || [],
              title: editingDraft.title,
              subtitle: editingDraft.subtitle || '',
              quote: editingDraft.opening_quote || '',
              content: editingDraft.content || '',
            }}
          />
        ) : (
          <BlogStudio onBackToHub={handleBack} />
        )}
      </div>
    );
  }

  const drafts = blogs.filter(b => b.status.toLowerCase() === 'draft');
  const published = blogs.filter(b => b.status.toLowerCase() === 'published');

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Blog Studio</h1>
          <p className={styles.subtitle}>Manage your medical blogs and patient engagement</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreator(true)}>
          <span className={styles.createBtnIcon}>✦</span>
          Create New Blog
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{drafts.length}</div>
          <div className={styles.statLabel}>Drafts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{published.length}</div>
          <div className={styles.statLabel}>Published</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{pendingCommentsCount}</div>
          <div className={styles.statLabel}>Pending Comments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{blogs.reduce((s, b) => s + (b.estimated_read_time || 0), 0)} min</div>
          <div className={styles.statLabel}>Total Read Time</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'drafts' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('drafts')}
        >
          Drafts
          {drafts.length > 0 && <span className={styles.badge}>{drafts.length}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'published' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('published')}
        >
          Published
          {published.length > 0 && <span className={styles.badge}>{published.length}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'comments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <span className={styles.tabLabelFull}>Comment Moderation</span>
          <span className={styles.tabLabelShort}>Comments</span>
          {pendingCommentsCount > 0 && <span className={styles.badge} style={{ backgroundColor: '#F59E0B' }}>{pendingCommentsCount}</span>}
        </button>
      </div>

      {/* ── Content area ── */}
      <div className={styles.contentArea}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className={styles.loadingSpinner}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your studio...</p>
          </div>
        ) : activeTab === 'comments' ? (
          <CommentModerationView />
        ) : (
          <div className={styles.blogGrid}>
            {(activeTab === 'drafts' ? drafts : published).length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  {activeTab === 'drafts' ? '📝' : '🚀'}
                </div>
                <h3 className={styles.emptyTitle}>
                  No {activeTab} yet
                </h3>
                <p className={styles.emptyMessage}>
                  {activeTab === 'drafts' 
                    ? "You don't have any blog drafts. Start sharing your expertise today!"
                    : "You haven't published any blogs yet. Complete a draft to see it here."}
                </p>
                {activeTab === 'drafts' && (
                  <button className={styles.createBtn} onClick={() => setShowCreator(true)}>
                    Create your first blog
                  </button>
                )}
              </div>
            ) : (
              (activeTab === 'drafts' ? drafts : published).map(blog => (
                <BlogCard 
                  key={blog.id} 
                  blog={blog} 
                  onContinue={() => setEditingDraft(blog)} 
                  onDelete={() => handleDeleteBlog(blog.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCard({ blog, onContinue, onDelete }: { blog: BlogCardData; onContinue?: () => void; onDelete?: () => void }) {
  const isDraft = blog.status.toLowerCase() === 'draft';
  return (
    <div className={styles.blogCard}>
      <div className={styles.blogCardTop}>
        <span className={`${styles.statusBadge} ${isDraft ? styles.statusDraft : styles.statusPublished}`}>
          {isDraft ? 'Draft' : 'Published'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={styles.readTime}>
            {blog.estimated_read_time || 0} min read
          </span>
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ background: '#FFF5F5', border: '1px solid #FED7D7', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', transition: 'all 0.2s', display: 'flex', color: '#E53E3E', alignItems: 'center', justifyContent: 'center' }}
              title="Delete draft"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <h3 className={styles.blogTitle}>{blog.title}</h3>
      <p className={styles.blogSubtitle}>{blog.subtitle}</p>
      
      <div className={styles.keywords}>
        {blog.keywords?.slice(0, 3).map((kw, i) => (
          <span key={i} className={styles.keyword}>{kw}</span>
        ))}
        {blog.keywords && blog.keywords.length > 3 && (
          <span className={styles.keyword}>+{blog.keywords.length - 3}</span>
        )}
      </div>
      
      <div className={styles.blogCardFooter}>
        <span className={styles.dateLabel}>
          Updated {formatDate(blog.updated_at || blog.created_at)}
        </span>
        {isDraft ? (
          <button className={styles.continueBtn} onClick={onContinue}>
            Continue editing →
          </button>
        ) : (
          <button className={styles.viewBtn}>
            View live →
          </button>
        )}
      </div>
    </div>
  );
}
