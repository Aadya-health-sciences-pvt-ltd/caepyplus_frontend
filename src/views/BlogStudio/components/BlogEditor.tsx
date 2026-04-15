import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import styles from '../BlogStudio.module.css';
import { doctorService } from '../../../services/doctorService';

interface BlogEditorProps {
  topic: string;
  keywords: string[];
  title: string;
  subtitle: string;
  quote: string;
  content: string;
  blogId?: number | string;
  onSaveDraft?: () => Promise<number | string | undefined>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onBackToHub?: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 'bold' }}
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontStyle: 'italic' }}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
      >
        H3
      </button>
      
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        title="Bullet List"
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        title="Quote Block"
      >
        ❝ Quote
      </button>
      
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 0.5rem' }} />
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', opacity: editor.can().undo() ? 1 : 0.5 }}
        title="Undo"
      >
        ↺
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', opacity: editor.can().redo() ? 1 : 0.5 }}
        title="Redo"
      >
        ↻
      </button>
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button 
            style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--primary-hover)', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            title="Grammar & flow improvement would go here"
        >
          ✦ Improve
        </button>
      </div>
    </div>
  );
};

export default function BlogEditor({ topic, keywords, title, subtitle, quote, content, blogId, onSaveDraft, onChange, onNext, onBack, onBackToHub }: BlogEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange('content', editor.getHTML());
    },
  });

  // Auto-generate content on mount if it is completely empty
  useEffect(() => {
    const generateAll = async () => {
      if (!content && !subtitle && !quote && topic) {
        setIsGenerating(true);
        setGenerateError(null);
        try {
          const generated = await doctorService.generateBlogContent(topic, keywords);
          onChange('subtitle', generated.subtitle || '');
          onChange('quote', generated.opening_quote || '');
          onChange('content', generated.content || '');
          
          if (editor) {
             editor.commands.setContent(generated.content || '');
          }
        } catch (err: any) {
          console.error("AI Generation failed:", err);
          setGenerateError("Failed to auto-generate content. Please write manually or try again.");
        } finally {
          setIsGenerating(false);
        }
      }
    };

    if (editor) {
      generateAll();
    }
  }, [editor, topic, keywords, content, subtitle, quote, onChange]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      let currentBlogId = blogId;
      // If we don't have a blog ID (draft not saved yet), trigger a save first
      if (!currentBlogId && onSaveDraft) {
        currentBlogId = await onSaveDraft();
      }
      
      if (!currentBlogId) {
        throw new Error("Could not save draft before uploading image.");
      }

      // Upload the image via doctorService
      const result = await doctorService.uploadBlogImage(currentBlogId, file);
      
      // Inject image into Tiptap
      editor.chain().focus().setImage({ src: result.url }).run();
      
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file could be selected again if needed
      if (e.target) e.target.value = '';
    }
  };

  if (isGenerating) {
    return (
      <div className={styles.stepContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div className={styles.spinner}></div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-color)' }}>
          Personalizing your content...
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.5, margin: '0 auto' }}>
          Our medical AI is carefully structuring your thoughts and chosen keywords to create an empathetic, SEO-optimized blog draft tailored for your patients.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.scrollArea}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Blog title <span style={{ color: 'var(--primary-color)', marginLeft: '0.5rem', fontWeight: 800 }}>✦ AI Suggested</span>
          </label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => onChange('title', e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700, background: '#F8FAFC' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Subtitle <span style={{ color: 'var(--primary-color)', marginLeft: '0.5rem', fontWeight: 800 }}>✦ AI Suggested</span>
          </label>
          <input 
            type="text" 
            value={subtitle} 
            onChange={(e) => onChange('subtitle', e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '1rem', background: '#F8FAFC' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
          Opening quote <span style={{ color: 'var(--primary-color)', marginLeft: '0.5rem', fontWeight: 800 }}>✦ AI Suggested</span>
        </label>
        <textarea 
          value={quote} 
          onChange={(e) => onChange('quote', e.target.value)}
          style={{ width: '100%', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.95rem', minHeight: '80px', fontStyle: 'italic', backgroundColor: '#F8FAFC', lineHeight: 1.6 }}
        />
      </div>

      <div style={{ marginBottom: '2.5rem', position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.85rem', letterSpacing: '0.05em' }}>
          Blog content
        </label>
        
        {generateError ? (
            <div style={{ border: '1px solid var(--error-color)', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center', color: 'var(--error-color)', background: '#FFF5F5' }}>
                <p style={{ fontWeight: 600 }}>{generateError}</p>
            </div>
        ) : (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'white', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
                <MenuBar editor={editor} />
              </div>
              <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                <EditorContent 
                  editor={editor} 
                  style={{ outline: 'none', minHeight: '300px' }} 
                  className="ProseMirror"
                />
              </div>
            </div>
        )}
      </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div 
            style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: '1rem', 
              padding: '2.5rem 1.5rem', 
              textAlign: 'center',
              cursor: isUploading ? 'wait' : 'pointer',
              backgroundColor: '#F8FAFC',
              transition: 'all 0.2s',
              opacity: isUploading ? 0.7 : 1
            }}
            onClick={() => !isUploading && document.getElementById('blogImageUpload')?.click()}
          >
            <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>🖼️</div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-color)' }}>
               {isUploading ? 'Uploading...' : 'Add Visual Context'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
               Clinic photos, Awareness posters, or infographics boost engagement by 80%
            </div>
            <input 
               type="file" 
               id="blogImageUpload" 
               accept="image/*" 
               style={{ display: 'none' }} 
               onChange={handleImageUpload} 
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btnBack} onClick={onBack}>← Back</button>
            {onBackToHub && (
              <button 
                className={styles.btnBack} 
                onClick={onBackToHub} 
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Exit to Hub
              </button>
            )}
          </div>
          <button 
            className={styles.btnNext} 
            onClick={onNext}
            disabled={!title}
          >
            Preview & publish →
          </button>
        </div>
      </div>
    </div>
  );
}
