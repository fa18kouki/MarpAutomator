'use client';

import { Bot, User } from 'lucide-react';
import type { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* アバター */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-blue-500'
            : 'bg-gradient-to-br from-green-500 to-teal-500'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* メッセージ本文 */}
      <div
        className={`flex-1 max-w-[80%] ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
              : 'bg-gray-800 text-gray-100 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
