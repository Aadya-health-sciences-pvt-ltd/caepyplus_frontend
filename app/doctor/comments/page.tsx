import React from 'react';
import CommentModerationView from '@/views/CommentModeration/CommentModerationView';

export const metadata = {
  title: 'Comment Moderation - CAEPY',
  description: 'Moderate patient comments on your Practice Hub blogs.',
};

export default function CommentModerationPage() {
  return <CommentModerationView />;
}
