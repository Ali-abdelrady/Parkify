
import React from 'react';

interface MessageDisplayProps {
  message: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  // Split message by newlines to support multi-line messages
  const messageLines = message.split('\\n');

  return (
    <div className="message-container">
      <div className="message-text">
        {messageLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default MessageDisplay;
