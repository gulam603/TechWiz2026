import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const WELCOME = {
  from: 'bot',
  text: "Hi! I'm Basket 🧺, the MarketLink assistant.\nAsk me about market timings, which farmers are available, pickup windows or where to find a product.",
  suggestions: ['Market timings', 'Where can I buy mangoes?', 'Pickup windows', 'How do I pay?'],
};

/** Renders **bold** text from the assistant's replies safely (no HTML injection). */
function RichText({ text }) {
  return text.split('\n').map((line, i) => (
    <Fragment key={i}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : <Fragment key={j}>{part.replace(/\*([^*]+)\*/g, '$1')}</Fragment>
      )}
      {i < text.split('\n').length - 1 && <br />}
    </Fragment>
  ));
}

/** Floating AI assistant (rule-based chatbot answered by the MarketLink API). */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || typing) return;
    setInput('');
    setMessages((m) => [...m, { from: 'me', text: message }]);
    setTyping(true);
    try {
      const res = await api.post('/assistant', { message });
      setMessages((m) => [...m, { from: 'bot', text: res.reply, cards: res.cards, suggestions: res.suggestions }]);
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: err.message || 'Sorry, something went wrong.' }]);
    } finally {
      setTyping(false);
    }
  }

  const last = messages[messages.length - 1];

  return (
    <>
      {open && (
        <section className="chat-panel" aria-label="MarketLink assistant">
          <div className="chat-head">
            <span className="bot-avatar">
              <img src="/illustrations/basket.webp" alt="" />
            </span>
            <div className="flex-grow-1">
              <strong className="d-block">Basket · AI assistant</strong>
              <span className="fs-7" style={{ color: 'rgba(255,255,255,.7)' }}>
                <i className="bi bi-circle-fill text-lime" style={{ fontSize: 7 }} /> Answers from live market data
              </span>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setOpen(false)} aria-label="Close assistant" />
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <Fragment key={i}>
                <div className={`msg ${m.from}`}>
                  <RichText text={m.text} />
                </div>
                {m.cards?.length > 0 && (
                  <div className="chat-cards">
                    {m.cards.map((c) => (
                      <Link key={c.kind + c.id} to={c.link} className="chat-card" onClick={() => setOpen(false)}>
                        {c.image ? <img src={c.image} alt="" /> : <i className="bi bi-receipt fs-4 text-success" />}
                        <span>
                          <strong>{c.title}</strong>
                          <span className="text-muted-2">{c.subtitle}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
            {typing && (
              <div className="msg bot typing" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            )}
            {!typing && last?.from === 'bot' && last.suggestions?.length > 0 && (
              <div className="suggestions">
                {last.suggestions.map((s) => (
                  <button type="button" key={s} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about markets, farmers, products…" aria-label="Message" maxLength={300} />
            <button type="submit" className="btn btn-primary btn-icon" aria-label="Send" disabled={!input.trim() || typing}>
              <i className="bi bi-send-fill" />
            </button>
          </form>
        </section>
      )}
      <button type="button" className="chat-launcher" onClick={() => setOpen(!open)} aria-label={open ? 'Close assistant' : 'Open AI assistant'} aria-expanded={open}>
        {!open && <span className="pulse" />}
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} />
      </button>
    </>
  );
}
