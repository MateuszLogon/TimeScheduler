import React, { useState, useEffect } from 'react';
import './App.css';

async function CheckSession(event_id) {
  try {
    const response = await fetch('http://localhost:8000/api/' + event_id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok; // Zwróć true dla statusu 200-299
  } catch (error) {
    console.error('Error checking session:', error);
    return false; // Zwróć false w przypadku błędu
  }
}

function JoinSession({ event_id }) {
  const [sessionExists, setSessionExists] = useState(null); // Przechowywanie stanu sesji
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Sprawdź sesję po załadowaniu komponentu
  useEffect(() => {
    const checkSession = async () => {
      const result = await CheckSession(event_id);
      setSessionExists(result); // Ustaw stan na true lub false
    };
    checkSession();
  }, [event_id]);

  // Funkcja obsługująca wysyłanie formularza
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = { name, email };

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
          setMessage(data.message)
        } else {
          setMessage('An error occurred. Please try again.');
        }
      })
      .catch((error) => {
        setMessage('An error occurred. Please try again.');
      });
  };

  // Renderuj odpowiednio na podstawie stanu sesji
  if (sessionExists === null) {
    return <div>Loading...</div>; // Wyświetl ładowanie podczas sprawdzania sesji
  }

  if (sessionExists) {
    return (
      <div className="App">
        <h1>Welcome to the App</h1>
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

        {message && <p>{message}</p>}
      </div>
    );
  } else {
    return <div>Session not found. Please log in.</div>;
  }
}

function CreateSession() {

}

export default function App() {
  return (<JoinSession event_id={1} />)
}