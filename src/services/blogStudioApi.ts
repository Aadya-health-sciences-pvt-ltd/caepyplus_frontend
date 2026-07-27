import api, { parseResponse } from '../lib/api';
import axios from 'axios';
import type { BlogTopic } from './doctorService';

/** Blog Studio API — doctor self-service or content creator on behalf of a doctor. */
export interface BlogStudioApi {
    basePath: string;
    getBlogTopics(): Promise<{ topics: BlogTopic[] }>;
    getBlogKeywords(topic: string): Promise<{ keywords: string[] }>;
    generateBlogContent(
        topic: string,
        keywords: string[],
    ): Promise<{ subtitle: string; opening_quote: string; content: string }>;
    saveBlogDraft(blogData: Record<string, unknown>): Promise<{ id?: number } & Record<string, unknown>>;
    uploadBlogImage(blogId: string | number, file: File): Promise<{ url: string; message: string }>;
    getBlogs(status?: string): Promise<unknown[]>;
    deleteBlog(blogId: number): Promise<void>;
    publishBlogToPracticeHub(
        blogId: string | number,
        credentials?: { username: string; password: string },
    ): Promise<Record<string, unknown>>;
    getComments(status?: string): Promise<unknown[]>;
    updateCommentStatus(id: number, status: string): Promise<void>;
}

function resolveUploadedImageUrl(url: string): string {
    if (!url || !url.startsWith('/')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    try {
        const parsedBase = new URL(baseUrl);
        return `${parsedBase.origin}${url}`;
    } catch {
        return `http://localhost:8000${url}`;
    }
}

function createBlogApi(basePath: string): BlogStudioApi {
    return {
        basePath,

        async getBlogTopics() {
            const response = await api.get<{ topics: BlogTopic[] }>(
                `${basePath}/insights/topics`,
            );
            return response.data;
        },

        async getBlogKeywords(topic: string) {
            const response = await api.get<{ keywords: string[] }>(
                `${basePath}/insights/keywords?topic=${encodeURIComponent(topic)}`,
            );
            return response.data;
        },

        async generateBlogContent(topic: string, keywords: string[]) {
            const response = await api.post(`${basePath}/insights/generate-content`, {
                topic,
                keywords,
            });
            return response.data;
        },

        async saveBlogDraft(blogData) {
            let blogId = blogData.id as number | undefined;

            const persistUpdate = async (id: number) => {
                const updateRes = await api.put(`${basePath}/${id}`, {
                    title: blogData.title,
                    subtitle: blogData.subtitle,
                    opening_quote: blogData.quote || blogData.opening_quote,
                    content: blogData.content,
                    keywords: blogData.keywords,
                });
                return parseResponse(updateRes) as { id?: number } & Record<string, unknown>;
            };

            if (!blogId) {
                const createRes = await api.post(basePath, {
                    title: (blogData.title as string) || 'Untitled Blog',
                });
                const createdBlog = parseResponse<{ id: number }>(createRes);
                blogId = createdBlog.id;
                return persistUpdate(blogId);
            }

            try {
                return await persistUpdate(blogId);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    const createRes = await api.post(basePath, {
                        title: (blogData.title as string) || 'Untitled Blog',
                    });
                    const createdBlog = parseResponse<{ id: number }>(createRes);
                    return persistUpdate(createdBlog.id);
                }
                throw err;
            }
        },

        async uploadBlogImage(blogId, file) {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post<{ url: string; message: string }>(
                `${basePath}/${blogId}/images`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            const data = response.data;
            if (data.url) {
                data.url = resolveUploadedImageUrl(data.url);
            }
            return data;
        },

        async getBlogs(status?: string) {
            const url = status ? `${basePath}?status=${status}` : basePath;
            const response = await api.get(url);
            return parseResponse<unknown[]>(response);
        },

        async deleteBlog(blogId) {
            await api.delete(`${basePath}/${blogId}`);
        },

        async publishBlogToPracticeHub(blogId, credentials) {
            const body = credentials
                ? { credentials: { username: credentials.username, password: credentials.password } }
                : {};
            const response = await api.post(`${basePath}/${blogId}/publish-practice-hub`, body);
            return parseResponse(response) as Record<string, unknown>;
        },

        async getComments(status?: string) {
            const url = status
                ? `${basePath}/comments?status=${status}`
                : `${basePath}/comments`;
            const response = await api.get(url);
            return parseResponse<unknown[]>(response);
        },

        async updateCommentStatus(id, status) {
            await api.put(`${basePath}/comments/${id}/status`, { status });
        },
    };
}

export const doctorBlogStudioApi = createBlogApi('/blogs');

export function contentBlogStudioApi(doctorId: number): BlogStudioApi {
    return createBlogApi(`/content/doctors/${doctorId}/blogs`);
}
