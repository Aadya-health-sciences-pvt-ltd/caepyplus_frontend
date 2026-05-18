import React, { useState, useEffect } from 'react';
import styles from '../BlogStudio.module.css';
import { doctorService, DoctorProfile } from '../../../services/doctorService';

interface PublishPreviewProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onPublish: () => void;
  onBack: () => void;
  onBackToHub?: () => void;
}

export default function PublishPreview({ formData, setFormData, onPublish, onBack, onBackToHub }: PublishPreviewProps) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProfile(doctorService.getStoredProfile());
    
    // Auto-save as draft once on mount
    doctorService.saveBlogDraft(formData).then(result => {
      // If we got back an ID (new draft created), store it for subsequent saves
      const returnedId = result?.id;
      if (returnedId && !formData.id) {
        setFormData((prev: any) => ({ ...prev, id: returnedId }));
      }
    }).catch(err => console.error("Failed to auto save draft:", err));
  }, []);

  const handleSaveAndExit = async () => {
    setSaving(true);
    try {
      await doctorService.saveBlogDraft(formData);
      alert('Saved to your Blog Studio');
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      window.location.href = `${basePath}/doctor/blog-studio`;
    } catch (err) {
      console.error("Manual save failed:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const doctorName = profile?.full_name || 'Anonymous Doctor';
  const specialty = profile?.specialty || 'Doctor';
  const location = profile?.primary_practice_location || '';
  
  // Strip HTML for plain excerpt and calculate read time
  const rawText = formData.content ? formData.content.replace(/<[^>]+>/g, ' ') : '';
  const excerpt = rawText.substring(0, 150) + '...';
  const wordCount = rawText.split(/\s+/).filter((word: string) => word.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={styles.stepContent}>
      
      <div style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '1.25rem', marginBottom: '2rem', backgroundColor: '#F8FAFC', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.4rem 0.75rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.65rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Practice Hub</div>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }}></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PREVIEW</div>
        </div>
        
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {formData.title || 'Untitled Blog Post'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 500 }}>
          {doctorName} {specialty ? `· ${specialty}` : ''} {location ? `· ${location}` : ''} · {readTime} min read
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', fontStyle: 'italic', opacity: 0.85 }}>
          {excerpt || 'Generating preview of your blog content...'}
        </p>

        <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <button 
               onClick={() => setShowPreview(true)}
               style={{ padding: '0.65rem 1.25rem', border: '1px solid var(--primary-color)', borderRadius: '0.75rem', background: 'white', cursor: 'pointer', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
               👁️ Full Web Preview
            </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-color)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>Auto-publishing</h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', opacity: 0.4 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Practice Hub Feed</span>
            <div style={{ width: '36px', height: '20px', backgroundColor: '#E5E7EB', borderRadius: '20px', position: 'relative' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', opacity: 0.4 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>LinkedIn Share</span>
            <div style={{ width: '36px', height: '20px', backgroundColor: '#E5E7EB', borderRadius: '20px', position: 'relative' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Instagram Story</span>
            <div style={{ width: '36px', height: '20px', backgroundColor: '#E5E7EB', borderRadius: '20px', position: 'relative' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.75rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-color)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>Search optimization</h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Target Keywords</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', padding: '0.2rem 0.5rem', background: '#D1FAE5', borderRadius: '4px' }}>{formData.keywords?.length || 0} applied ✔</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Structural Schema</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', padding: '0.2rem 0.5rem', background: '#D1FAE5', borderRadius: '4px' }}>MedicalWebPage ✔</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Read Time Focus</span>
            <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem' }}>{readTime} minutes</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.75rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #F59E0B', borderRadius: '0 1rem 1rem 0' }}>
        <h5 style={{ color: '#D97706', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span>📥</span> Draft Automatically Updated
        </h5>
        <p style={{ color: '#92400E', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Everything is staged and ready. You can safely exit; this blog will be waiting in your **Drafts** hub.
        </p>
      </div>

      <div className={styles.footer}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <button className={styles.btnBack} onClick={onBack} disabled={saving}>← Back to Editor</button>
          
          {onBackToHub && (
            <button 
              className={styles.btnBack} 
              onClick={onBackToHub} 
              disabled={saving}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Exit to Hub
            </button>
          )}

          <button 
            className={styles.btnNext} 
            onClick={handleSaveAndExit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>Full Web Preview</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HOW IT APPEARS ON PRACTICE HUB</p>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                style={{ background: '#eee', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem' }}>
              <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '2rem', color: '#1a202c' }}>
                  {formData.title}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                    {doctorName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2d3748' }}>{doctorName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{specialty} · {readTime} min read</div>
                  </div>
                </div>

                {formData.quote && (
                  <div style={{ 
                    padding: '2rem', 
                    borderLeft: '4px solid var(--primary-color)', 
                    backgroundColor: '#f8fafc', 
                    marginBottom: '2.5rem',
                    borderRadius: '0 1rem 1rem 0'
                  }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary-color)', opacity: 0.2, marginBottom: '-1rem', marginTop: '-0.5rem', fontFamily: 'serif' }}>"</div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4a5568', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                      {formData.quote}
                    </p>
                  </div>
                )}

                <div 
                  className="ProseMirror"
                  style={{ fontSize: '1.15rem', lineHeight: 1.8, color: '#4a5568' }}
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content available.</p>' }} 
                />
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', textAlign: 'center', background: '#f8fafc' }}>
               <button 
                 onClick={() => setShowPreview(false)}
                 style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
               >
                 Close Preview
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
