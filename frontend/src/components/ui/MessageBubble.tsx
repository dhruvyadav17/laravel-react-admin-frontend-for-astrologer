// Chat message bubble — used in both user ConsultationPage and astrologer ChatPage.
import Avatar from './Avatar';
import type { ChatMessage } from '../../types/models';

type Props = {
  msg:  ChatMessage;
  isMe: boolean;
};

export default function MessageBubble({ msg, isMe }: Props) {
  const time = new Date(msg.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`d-flex gap-2 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
      {!isMe && <Avatar name={msg.sender.name} src={msg.sender.profile_image} size={28} />}

      <div style={{ maxWidth: '72%' }}>
        <div
          className={`px-3 py-2 rounded-3 ${isMe ? 'bg-primary text-white' : ''}`}
          style={{
            background:  isMe ? undefined : 'var(--surf3)',
            border:      isMe ? undefined : '1px solid var(--bdr)',
            wordBreak:   'break-word',
            lineHeight:  1.5,
            fontSize:    14,
          }}
        >
          {msg.message}
        </div>
        <div className={`d-flex align-items-center gap-1 mt-1 ${isMe ? 'justify-content-end' : ''}`}
          style={{ fontSize: 11, color: 'var(--txt-l)' }}>
          {time}
          {isMe && (
            <i className={`fas ${msg.is_read ? 'fa-check-double text-primary' : 'fa-check'}`}
              style={{ fontSize: 10 }} />
          )}
        </div>
      </div>

      {isMe && <Avatar name={msg.sender.name} src={msg.sender.profile_image} size={28} />}
    </div>
  );
}
