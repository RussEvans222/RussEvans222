// position values: 'only' | 'first' | 'mid' | 'last'
export default function MessageBubble({ msg, contactInitials }) {
  const { sender, text, imageUrl, position, status } = msg
  const isSent = sender === 'me'

  const showAvatar = !isSent && (position === 'only' || position === 'last')

  return (
    <div className={`msg-row msg-row--${isSent ? 'sent' : 'received'} msg-row--${position}`}>
      {!isSent && (
        <div className={`msg-avatar${showAvatar ? '' : ' msg-avatar--hidden'}`}>
          {contactInitials}
        </div>
      )}

      <div className="msg-content">
        {text ? <div className="msg-bubble">{text}</div> : null}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Shared photo"
            className={`msg-image msg-image--${isSent ? 'sent' : 'received'}`}
            loading="lazy"
          />
        ) : null}
      </div>

      {isSent && (position === 'only' || position === 'last') && status && (
        <div className="msg-status">{status === 'read' ? 'Read' : 'Delivered'}</div>
      )}
    </div>
  )
}
