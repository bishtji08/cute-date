import React, { useEffect, useRef, useState } from "react";

const noMessages = [
  "Are you sure? 🥺",
  "Think again!",
  "Pleaseee 💗",
  "One tiny yes? 🐻",
  "I'll bring snacks!",
  "I promise to be a good gurl! 💙",
  "I can be your movie buddy! 🎬",
  "I can be your cuddle buddy! 🥹",
  "I can be your shopping buddy! 🛍️",
  "I can be your gaming buddy! 🎮",
  "I can be your study buddy! 📚", 
];

async function logResponse(event, message) {
  const response = await fetch("/api/log-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, message }),
  });
  if (!response.ok) throw new Error("Could not save your message.");
}

async function submitNetlifyResponse(responseType, message = "") {
  const body = new URLSearchParams({
    "form-name": "date-invitation",
    response: responseType,
    message,
  });
  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) throw new Error("Could not submit the response.");
}

function Bear({ mood = "happy", className = "" }) {
  return (
    <div className={`bear-wrap ${className}`} aria-label="Cute cartoon bear" role="img">
      {mood === "pleading" && <div className="please-label">PLISS ✨</div>}
      <div className={`bear bear-${mood}`}>
        <span className="ear ear-left" />
        <span className="ear ear-right" />
        <span className="cheek cheek-left" />
        <span className="cheek cheek-right" />
        <span className="eye eye-left">{mood === "pleading" ? "♥" : "•"}</span>
        <span className="eye eye-right">{mood === "pleading" ? "♥" : "•"}</span>
        <span className="snout" />
        <span className="nose" />
        <span className="mouth" />
        {mood === "pleading" && <span className="paws">♡</span>}
      </div>
      {mood === "happy" && <span className="tiny-sparkle sparkle-one">✦</span>}
      {mood === "happy" && <span className="tiny-sparkle sparkle-two">✧</span>}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 8, y: 58 });
  const [noMessage, setNoMessage] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSendError, setMessageSendError] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const playAreaRef = useRef(null);
  const noButtonRef = useRef(null);
  const messageDialogRef = useRef(null);
  const hasLoggedOpen = useRef(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (hasLoggedOpen.current) return;
    hasLoggedOpen.current = true;
    logResponse("opened").catch(() => {});
  }, []);

  useEffect(() => {
    const dialog = messageDialogRef.current;
    if (!dialog) return;
    if (messageDialogOpen && !dialog.open) dialog.showModal();
    if (!messageDialogOpen && dialog.open) dialog.close();
  }, [messageDialogOpen]);

  useEffect(() => {
    if (screen !== "success") return;
    setConfetti(true);
    const timer = window.setTimeout(() => setConfetti(false), 3200);
    return () => window.clearTimeout(timer);
  }, [screen]);

  function moveNoButton() {
    const area = playAreaRef.current;
    const button = noButtonRef.current;
    if (!area || !button) return;
    const areaRect = area.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const maxX = Math.max(0, areaRect.width - buttonRect.width - 12);
    const maxY = Math.max(0, areaRect.height - buttonRect.height - 12);
    const nextX = Math.random() * maxX;
    const nextY = Math.random() * maxY;
    setNoPosition({ x: nextX, y: nextY });
    setNoCount((count) => count + 1);
    setNoMessage(noMessages[noCount % noMessages.length]);
    if (import.meta.env.DEV) {
      logResponse("no_attempt").catch(() => {});
    } else {
      submitNetlifyResponse("no", "No button attempt").catch(() => {});
    }
  }

  function acceptInvite() {
    setMessageSendError("");
    setMessageDialogOpen(true);
  }

  async function sendInviteMessage(event) {
    event.preventDefault();
    const message = messageDraft.trim();
    if (!message || isSendingMessage) return;

    setIsSendingMessage(true);
    setMessageSendError("");
    try {
      if (import.meta.env.DEV) {
        await logResponse("yes", message);
      } else {
        await submitNetlifyResponse("yes", message);
      }
      setMessageDialogOpen(false);
      setScreen("success");
    } catch {
      setMessageSendError("Message couldn't be saved. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="invite-panel" aria-live="polite">
        <div className="watermark" aria-hidden="true">CUTIE</div>

        {screen === "welcome" && (
          <div className="screen welcome-screen">
            <h1>Yeeey! Finally</h1>
            <Bear mood="happy" />
            <button className="button button-primary welcome-button" onClick={() => setScreen("question")}>
            Question Time! 💌
            </button>
            <p className="micro-copy">A tiny question for you💙</p>
            <p className="micro-copy">without answers don't go back</p>
          </div>
        )}

        {screen === "question" && (
          <div className="screen question-screen">
             <h1>Heyy Lilly!</h1>
            <h1>Do you wanna go out with me?</h1>
            <Bear mood="pleading" />
            <div className="button-play-area" ref={playAreaRef}>
              <button
                ref={noButtonRef}
                className="button button-no"
                style={{ left: `${noPosition.x}px`, top: `${noPosition.y}px` }}
                onClick={moveNoButton}
                onMouseEnter={moveNoButton}
                aria-label="No, ask me again"
              >
                No
              </button>
              <button className="button button-yes" onClick={acceptInvite}>
                Yes 💗
              </button>
            </div>
            <p className="no-message" role="status">{noMessage}</p>
            <p className="micro-copy question-hint">the blue button is a little shy like you!</p>
          </div>
        )}

        {screen === "success" && (
          <div className="screen success-screen">
            {confetti && (
              <div className="confetti-layer" aria-hidden="true">
                {Array.from({ length: 26 }, (_, i) => (
                  <span key={i} style={{ "--i": i, left: `${(i * 37) % 100}%` }}>{["💗", "✨", "💙", "💕", "✦"][i % 5]}</span>
                ))}
              </div>
            )}
            <h1>YAY! Good Gurl! 💖</h1>
            <Bear mood="happy" className="success-bear" />
            <p className="success-message">Thanks for saying yes! 💗</p>
            <p className="success-subtitle">Finally I can talk to you. 🥹</p>
            <button className="button button-primary" onClick={() => setScreen("question")}>
              Ask me again? ♡
            </button>
            <button className="text-button" onClick={() => { setScreen("welcome"); setNoCount(0); setNoMessage(""); }}>
              Back to the beginning
            </button>
          </div>
        )}
      </section>
      <footer className="page-footer">made with a little courage & lots of 💙</footer>
      <dialog
        ref={messageDialogRef}
        className="message-dialog"
        aria-labelledby="message-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          setMessageDialogOpen(false);
        }}
      >
        <button
          className="dialog-close"
          type="button"
          aria-label="Close message box"
          onClick={() => setMessageDialogOpen(false)}
        >
          ×
        </button>
        <form
          name="date-invitation"
          method="POST"
          data-netlify="true"
          onSubmit={sendInviteMessage}
        >
          <input type="hidden" name="form-name" value="date-invitation" />
          <input type="hidden" name="response" value="yes" />
          <h2 id="message-dialog-title">Send a little message 💌</h2>
          <label htmlFor="invite-message">Your message</label>
          <textarea
            id="invite-message"
            name="message"
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
            maxLength={500}
            required
            autoFocus
            placeholder="write timing and which day of the week you want to go..."
          />
          <div className="message-dialog-meta">
            <p className="message-send-error" role="alert">{messageSendError}</p>
            <span>{messageDraft.length}/500</span>
          </div>
          <div className="message-dialog-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setMessageDialogOpen(false)}
              disabled={isSendingMessage}
            >
              Not now
            </button>
            <button className="button button-primary" type="submit" disabled={isSendingMessage}>
              {isSendingMessage ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}
