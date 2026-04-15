'use client';

import React, { useState } from 'react';
import styles from './BlogStudio.module.css';
import Stepper from '../../components/ui/Stepper';
import TopicSelection from './components/TopicSelection';
import KeywordSelection from './components/KeywordSelection';
import BlogEditor from './components/BlogEditor';
import PublishPreview from './components/PublishPreview';

interface BlogStudioFormData {
  id?: number | string;
  topic: string;
  keywords: string[];
  title: string;
  subtitle: string;
  quote: string;
  content: string;
}

interface BlogStudioProps {
  initialStep?: number;
  initialData?: Partial<BlogStudioFormData>;
  onBackToHub?: () => void;
}

export default function BlogStudio({ initialStep = 1, initialData = {}, onBackToHub }: BlogStudioProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const [formData, setFormData] = useState<BlogStudioFormData>({
    id: initialData.id,
    topic: initialData.topic || '',
    keywords: initialData.keywords || [],
    title: initialData.title || '',
    subtitle: initialData.subtitle || '',
    quote: initialData.quote || '',
    content: initialData.content || '',
  });

  const handleNextStep1 = (topic: string) => {
    setFormData(prev => ({ ...prev, topic }));
    setCurrentStep(2);
  };

  const handleNextStep2 = (keywords: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      keywords,
      title: prev.title || prev.topic
    }));
    setCurrentStep(3);
  };

  const handleChangeStep3 = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = () => {
    // API call to publish would go here
    alert('Blog published to Practice Hub successfully!');
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    window.location.href = `${basePath}/doctor/blog-studio`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TopicSelection 
            onNext={handleNextStep1} 
            initialTopic={formData.topic} 
            onBack={onBackToHub}
          />
        );
      case 2:
        return (
          <KeywordSelection 
            topic={formData.topic}
            initialKeywords={formData.keywords}
            onNext={handleNextStep2}
            onBack={() => setCurrentStep(1)}
            onBackToHub={onBackToHub}
          />
        );
      case 3:
        return (
          <BlogEditor 
            topic={formData.topic}
            keywords={formData.keywords}
            title={formData.title}
            subtitle={formData.subtitle}
            quote={formData.quote}
            content={formData.content}
            blogId={formData.id}
            onSaveDraft={async () => {
                const { doctorService } = await import('../../services/doctorService');
                const result = await doctorService.saveBlogDraft(formData);
                if (result?.id) {
                   setFormData(prev => ({ ...prev, id: result.id }));
                   return result.id;
                }
                return undefined;
            }}
            onChange={handleChangeStep3}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            onBackToHub={onBackToHub}
          />
        );
      case 4:
        return (
          <PublishPreview 
            formData={formData}
            setFormData={setFormData}
            onPublish={handlePublish}
            onBack={() => setCurrentStep(3)}
            onBackToHub={onBackToHub}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'What do we voice out today?';
      case 2: return 'Finalise your keywords';
      case 3: return 'Write your blog';
      case 4: return 'Preview & push to Practice Hub';
      default: return '';
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {onBackToHub && (
            <button 
              onClick={onBackToHub}
              style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '1.2rem',
                flexShrink: 0,
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
              title="Return to Studio Dashboard"
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              ←
            </button>
          )}
          <div className={styles.headerContent}>
              <h1 className={styles.title}>Blog Studio</h1>
              <p className={styles.subtitle}>{getStepTitle()}</p>
          </div>
        </div>
        <div className={styles.stepperWrapper}>
            <Stepper currentStep={currentStep} totalSteps={4} onStepClick={setCurrentStep} />
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
            <div className={styles.formContainer}>
               {renderStep()}
            </div>
        </div>
      </div>
    </div>
  );
}
