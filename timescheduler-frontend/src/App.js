import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';


// Funkcja do sprawdzania sesji
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

// Komponent JoinSession
function JoinSession({ event_id }) {
  const [sessionExists, setSessionExists] = useState(null); // Przechowywanie stanu sesji
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


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
          navigate(`/voting_page/${event_id}`);  
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
        <h1>Time Scheduler</h1>
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

function VotingPage() {
  const { event_id } = useParams();  // Pobieranie event_id z URL
  const [proposedTimes, setProposedTimes] = useState([]);

  useEffect(() => {
    async function fetchProposedTimes() {
      try {
        const response = await fetch(`http://localhost:8000/api/event/${event_id}/proposed_times`);
        if (response.ok) {
          const data = await response.json();
          setProposedTimes(data); // Ustawienie danych o czasach
        } else {
          console.error('Failed to fetch proposed times');
        }
      } catch (error) {
        console.error('Error fetching proposed times:', error);
      }
    }

    fetchProposedTimes();
  }, [event_id]); // Zależność od event_id

  return (
    <div className="voting-page">
      <h1>Voting Page</h1>
      <div className="tiles-container">
        {proposedTimes.map(time => (
          <div key={time.time_id} className="tile">
            <div className="time-info">
              <p>{time.day} {time.day_number} {time.month} {time.year}</p>
              <p>{time.start_time} - {time.end_time}</p>
            </div>
            <div className="vote-buttons">
              <button>Yes</button>
              <button>No</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Komponent główny - App
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Główna ścieżka */}
        <Route path="/" element={<JoinSession event_id={1} />} />
        {/* Ścieżka do Voting Page z dynamicznym parametrem event_id */}
        <Route path="/voting_page/:event_id" element={<VotingPage />} />
      </Routes>
    </Router>
  );
}