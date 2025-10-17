import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' }[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    setMessages([...messages, { text: inputValue, sender: 'user' }]);
    setInputValue('');

    // Simulate a bot response
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { text: "Thanks for your message! I'm just a demo, but I'm learning.", sender: 'bot' }]);
    }, 1000);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4">
        Chat with us!
      </Button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">EcomX Assistant</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`my-2 p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'}`}>
                {message.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex">
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message..." />
            <Button onClick={handleSendMessage} className="ml-2">Send</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;