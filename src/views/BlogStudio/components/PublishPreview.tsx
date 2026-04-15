import React, { useState, useEffect } from 'react';
import styles from '../BlogStudio.module.css';
import { doctorService, DoctorProfile } from '../../../services/doctorService';

interface PublishPreviewProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onPublish: () => void;
  onBack: () => void;
}

export default function PublishPreview({ formData, setFormData, onPublish, onBack }: PublishPreviewProps) {
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
          <button className={styles.btnBack} onClick={onBack} disabled={saving}>← Back</button>
          <button 
            className={styles.btnNext} 
            onClick={handleSaveAndExit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
        </div>
      </div>
    </div>
  );
}
