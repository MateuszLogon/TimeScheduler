import React, { useState } from 'react';
import axios from 'axios';

const UserForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.post('http://localhost:8000/api/send_user_data/', {
        name,
        email
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <h1>Time Scheduler</h1>
      <h2>Please enter your name and email address to proceed</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label><br />
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br /><br />
        <label htmlFor="email">Email:</label><br />
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />
        <button type="submit">Send</button>
      </form>

      {response && (
        <div>
          <h3>Response from API:</h3>
          <p>Name: {response.name}</p>
          <p>Email: {response.email}</p>
        </div>
      )}
    </div>
  );
};

export default UserForm;