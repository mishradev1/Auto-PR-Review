import React, { useState, useEffect } from 'react';

const OAuth = () => {
  const [token, setToken] = useState(null);

  const handleLogin = () => {
    const clientID = import.meta.env.VITE_GITHUB_CLIENT_ID;  // GitHub Client ID from .env
    const redirectURI = "http://localhost:3000";
    const oauthURL = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=repo&redirect_uri=${redirectURI}`;
    window.location.href = oauthURL;
  };

  const handleTokenSave = async () => {
    if (!token) return alert("No OAuth token found!");

    const response = await fetch("http://localhost:5000/store-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      alert("GitHub OAuth token stored successfully!");
    } else {
      alert("Failed to store token!");
    }
  };

  const checkForToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch(`http://localhost:5000/exchange-token?code=${code}`)
        .then((res) => res.json())
        .then((data) => setToken(data.token));
    }
  };

  useEffect(() => {
    checkForToken();  // Check for OAuth token when component mounts
  }, []);

  return (
    <div className="flex flex-col items-center mb-8">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={handleLogin}
      >
        Connect GitHub
      </button>
      {token && (
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleTokenSave}
        >
          Save OAuth Token
        </button>
      )}
    </div>
  );
};

export default OAuth;
