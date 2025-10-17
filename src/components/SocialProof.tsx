import React, { useState, useEffect } from 'react';

const messages = [
  "Someone in New York just purchased a new iPhone!",
  "A customer from London just bought a new pair of shoes!",
  "Someone in Paris just ordered a new laptop!",
];

const SocialProof: React.FC = () => {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(true);
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => {
        setShow(false);
      }, 5000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      {message}
    </div>
  );
};

export default SocialProof;