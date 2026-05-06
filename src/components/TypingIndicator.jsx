export default function TypingIndicator({ contactInitials }) {
  return (
    <div className="typing-row">
      <div className="msg-avatar">{contactInitials}</div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
