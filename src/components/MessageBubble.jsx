// position values: 'only' | 'first' | 'mid' | 'last'
export default function MessageBubble({ msg, contactInitials }) {
  const { sender, text, position, status } = msg
  const isSent = sender === 'me'

  // Show avatar only for the last (or only) received bubble in a group
  const showAvatar = !isSent && (position === 'only' || position === 'last')

  return (
    <div className={`msg-row msg-row--${isSent ? 'sent' : 'received'} msg-row--${position}`}>
      {!isSent && (
        <div className={`msg-avatar${showAvatar ? '' : ' msg-avatar--hidden'}`}>
          {contactInitials}
        </div>
      )}

      <div className="msg-bubble">{text}</div>

      {isSent && (position === 'only' || position === 'last') && status && (
        <div className="msg-status">{status === 'read' ? 'Read' : 'Delivered'}</div>
      )}
    </div>
  )
}
