import React, { useState } from 'react';

const Webhook = () => {
  const [webhookCreated, setWebhookCreated] = useState(false);

  const handleCreateWebhook = async () => {
    const response = await fetch("http://localhost:5000/create-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      setWebhookCreated(true);
      alert("Webhook created successfully!");
    } else {
      alert("Failed to create webhook!");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={handleCreateWebhook}
      >
        Create Webhook
      </button>
      {webhookCreated && (
        <p className="mt-4 text-green-600 text-lg">Webhook has been created!</p>
      )}
    </div>
  );
};

export default Webhook;
