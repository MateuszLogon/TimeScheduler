import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar'

function ChoicePage() {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState('');

  const handleGoToCreateMeeting = () => {
    navigate('/create_meeting');
  };

  const handleGoToJoinSession = () => {
    if (eventId.trim() !== '') {
      navigate(`/join_session/${eventId}`);
    } else {
      alert('Please enter a valid event ID');
    }
  };

  return (
    <div className="choice-page">
      <h1>Welcome to Time Scheduler</h1>
      <div className="tiles-container">
        <div className="tile" onClick={handleGoToCreateMeeting}>
          <h2>Create a Meeting</h2>
        </div>
        <div className="tile">
          <h2>Join a Session</h2>
          <input
            type="text"
            placeholder="Enter Event ID"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
          <button onClick={handleGoToJoinSession}>Join</button>
        </div>
      </div>
    </div>
  );
}

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
function JoinSession() {
  const { event_id } = useParams(); // Pobieranie event_id z URL
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
        console.log("Response data:", data);
        if (data.message === 'User created successfully!') {
          // Zapisz user_id w localStorage
          localStorage.setItem('user_id', data.user_id);
          // Przejdź do strony głosowania
          navigate(`/voting_page/${event_id}`);
        } else {
          setMessage('Server did not receive user_id');
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
  const { event_id } = useParams(); // Pobieranie event_id z URL
  const [proposedTimes, setProposedTimes] = useState([]);
  const [selectedButtons, setSelectedButtons] = useState({});

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
  }, [event_id]);

  const handleVoteClick = (timeId, voteType) => {
    setSelectedButtons(prevState => ({
      ...prevState,
      [timeId]: voteType, // Zapisz wybór dla danego `timeId`
    }));
  };

  const handleSubmitVotes = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert('User not logged in');
      return;
    }

    const votes = Object.keys(selectedButtons).map(timeId => ({
      time_id: timeId,
      vote: selectedButtons[timeId],
    }));

    const requestData = {
      user_id: user_id,
      votes: votes,
    };

    try {
      const response = await fetch(`http://localhost:8000/api/event/${event_id}/submit_votes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const responseData = await response.json();
        alert(responseData.message || 'Votes submitted successfully');
      } else {
        alert('Failed to submit votes');
      }
    } catch (error) {
      console.error('Error submitting votes:', error);
      alert('Error submitting votes');
    }
  };

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
              <button
                className={selectedButtons[time.time_id] === 'yes' ? 'button-highlight' : ''}
                onClick={() => handleVoteClick(time.time_id, 'yes')}
              >
                Yes
              </button>
              <button
                className={selectedButtons[time.time_id] === 'no' ? 'button-highlight' : ''}
                onClick={() => handleVoteClick(time.time_id, 'no')}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmitVotes}>Send Response</button>
    </div>
  );
}

function CreateSession() {
  const [meeting_address, setMeetingAddress] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const totalHours = 24;
  const blockWidth = 60; 
  const [timeBlocks, setTimeBlocks] = useState(
      Array(totalHours).fill(false)
  );
  const [timePeriods, setTimePeriods] = useState([]);
  const [message, setMessage] = useState('');

  // Toggle block selection
  const toggleBlock = (index) => {
      const updatedBlocks = [...timeBlocks];
      updatedBlocks[index] = !updatedBlocks[index];
      setTimeBlocks(updatedBlocks);
  };

  // Extract contiguous time periods
  const extractTimePeriods = () => {
      const periods = [];
      let start = null;

      timeBlocks.forEach((isSelected, index) => {
          if (isSelected && start === null) {
              // Start a new period
              start = index;
          } else if (!isSelected && start !== null) {
              // End the current period
              periods.push([start, index - 1]);
              start = null;
          }
      });

      // Handle case where the last block is part of a period
      if (start !== null) {
          periods.push([start, timeBlocks.length - 1]);
      }

      const formattedPeriods = periods.map(([start, end]) => ({
          // start: `${start.toString().padStart(2, "0")}:00`,
          // end: `${(end + 1).toString().padStart(2, "0")}:00`,
          start: start,
          end: end
      }));
      setTimePeriods(formattedPeriods);

      let tmp_dates = [...dates];
      for (const period of formattedPeriods) {
          let tmp_date = new Date(date);
          let duration = period.end - period.start + 1;
          tmp_date.setHours(period.start, 0, 0, 0);
          const index = tmp_dates.findIndex(date => (date[0].getTime() === tmp_date.getTime()) && (date[1] === duration));
          if (index === -1) {
            tmp_dates.push([tmp_date, duration]);
          }
          else {
            tmp_dates.splice(index, 1);
          }
      }
      setDates(tmp_dates);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { meeting_address, name, dates };
  
    fetch('http://localhost:8000/api/create_session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response data:", data); 
        setMessage(data.message)
      })
      .catch((error) => {
        setMessage('Wystąpił błąd. Spróbuj ponownie.');
      });
  };

  return (
    <div className="App">
      <h1>Kreator sesji</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Adres:
            <input type="text" value={meeting_address} onChange={(e) => setMeetingAddress(e.target.value)} required />
          </label>
        </div>
        <div style={{ paddingRight: 42 }}>
          <label>
            Nazwa sesji:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        </div>
        <div className="Calendar" style={{ paddingLeft: 400, paddingRight: 400 }}>
          <label>Wybrana data: {date.getDate()}.{date.getMonth() + 1}.{date.getFullYear()}</label>
          <Calendar value={date} onChange={setDate} />
          <div>
            {/* Hours and Blocks */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {timeBlocks.map((_, index) => (
                <div
                  key={`hour-${index}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: `${blockWidth}px`,
                  }}
                >
                  {/* Hour Label */}
                  <span style={{ marginBottom: "5px", fontSize: "12px" }}>
                    {index.toString().padStart(2, "0")}:00
                  </span>
                  {/* Time Block */}
                  <div
                    onClick={() => toggleBlock(index)}
                    style={{
                      height: "40px",
                      width: "100%",
                      backgroundColor: timeBlocks[index] ? "green" : "gray",
                      border: "1px solid black",
                      cursor: "pointer",
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <button onClick={extractTimePeriods} style={{ marginTop: "20px" }} >
              Dodaj przedziały czasowe
            </button>
            {/* Display Time Periods */}
            <div style={{ marginTop: "20px" }}>
              <h3>Wybrane przedziały czasowe:</h3>
              {timePeriods.length === 0 ? (
                <p>Nie wybrano żadnych przedziałów.</p>
              ) : (
                <>
                  {dates.map((elem, index) =>
                    <p>{elem[0].getDate()}.{elem[0].getMonth()}.{elem[0].getFullYear()}: {elem[0].getHours().toString().padStart(2, "0")}:00 - {(elem[0].getHours() + elem[1]).toString().padStart(2, "0")}:00</p>
                  )}
                </>
              )}
            </div>
            <button type="submit">
              Wyślij formularz na serwer
            </button>
          </div>
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

// Komponent główny - App
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Główna ścieżka */}
        <Route path="/" element={<ChoicePage />} />
        <Route path="/create_meeting" element={<CreateSession />} />
        <Route path="/join_session/:event_id" element={<JoinSession />} />
        <Route path="/voting_page/:event_id" element={<VotingPage />} />
      </Routes>
    </Router>
  );
}