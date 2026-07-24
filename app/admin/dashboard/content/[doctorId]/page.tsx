'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BlogStudioHub from '@/views/BlogStudio/BlogStudioHub';
import { contentBlogStudioApi } from '@/services/blogStudioApi';

export default function ContentDoctorStudioPage() {
    const params = useParams();
    const doctorIdRaw = params?.doctorId;
    const doctorId = typeof doctorIdRaw === 'string' ? parseInt(doctorIdRaw, 10) : NaN;

    if (!Number.isFinite(doctorId) || doctorId <= 0) {
        return (
            <div style={{ padding: '2rem' }}>
                <p>Invalid doctor.</p>
                <Link href="/admin/dashboard/content">Back to Content</Link>
            </div>
        );
    }

    const exitHref = '/admin/dashboard/content';

    return (
        <div style={{ padding: '1rem 1.5rem 2rem' }}>
            <Link
                href={exitHref}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    marginBottom: '1rem',
                    color: '#4F46E5',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                }}
            >
                <ArrowLeft size={16} />
                Back to verified doctors
            </Link>
            <BlogStudioHub
                blogApi={contentBlogStudioApi(doctorId)}
                studioTitle="Blog Studio"
                studioSubtitle={`Creating content for doctor #${doctorId}`}
                contentDoctorId={doctorId}
                exitHref={exitHref}
            />
        </div>
    );
}
