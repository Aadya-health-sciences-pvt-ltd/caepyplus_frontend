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
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
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
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? styles.selected : ''}
        style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
      >
        List
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

export default function BlogEditor({ topic, keywords, title, subtitle, quote, content, onChange, onNext, onBack }: BlogEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  const addImage = useCallback(() => {
    const url = window.prompt('URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

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
            cursor: 'pointer',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s'
          }}
          onClick={addImage}
        >
          <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>🖼️</div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-color)' }}>Add Visual Context</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
             Clinic photos, Awareness posters, or infographics boost engagement by 80%
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <button className={styles.btnBack} onClick={onBack}>← Back</button>
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
