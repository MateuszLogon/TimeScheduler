import React, { useState } from 'react';
import './App.css';

function App() {
  // Stan do przechowywania wartości formularza
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');  // Stan na komunikaty

  // Funkcja obsługująca wysyłanie formularza
  const handleSubmit = (e) => {
    e.preventDefault();

    // Tworzenie danych formularza
    const formData = { name, email };

    // Wysłanie danych na serwer za pomocą fetch
    fetch('http://localhost:8000/api/create_user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setMessage(data.message);  // Wyświetl sukces
          setName('');
          setEmail('');
        } else {
          setMessage('An error occurred. Please try again.');
        }
      })
      .catch((error) => {
        setMessage('An error occurred. Please try again.');
      });
  };

  return (
    <div className="App">
      <h1>Time Scheduler</h1>
      <p>Please enter your name and email address to proceed</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </label>
        </div>

        <div>
          <label>
            Email:
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </label>
        </div>

        <div>
          <button type="submit">Send</button>
        </div>
      </form>

      {message && <p>{message}</p>}  {/* Wyświetl komunikat */}
    </div>
  );
}

export default App;
