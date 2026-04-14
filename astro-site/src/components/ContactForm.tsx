import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';

/**
 * ContactForm — functional contact form using Web3Forms.
 *
 * Web3Forms is a free, no-backend form service. The access key is a public
 * identifier (not a secret) — it's safe to expose client-side.
 *
 * Set PUBLIC_WEB3FORMS_KEY in your .env to your Web3Forms access key.
 * Register at web3forms.com to get one linked to s.prantap@gmail.com.
 */

type FormState = 'idle' | 'sending' | 'success' | 'error';

const ACCESS_KEY = (import.meta as Record<string, any>).env?.PUBLIC_WEB3FORMS_KEY ?? '';
const KEY_MISSING = !ACCESS_KEY || ACCESS_KEY === 'your_access_key_here';

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === 'sending') return;

    if (KEY_MISSING) {
      setState('error');
      setErrorMsg('Contact form is not configured yet. Please set PUBLIC_WEB3FORMS_KEY in .env.');
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setState('sending');
    setErrorMsg('');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();

      if (json.success) {
        setState('success');
        form.reset();
      } else {
        setState('error');
        setErrorMsg(json.message || 'Something went wrong. Try again.');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please try again.');
    }
  }, [state]);

  return (
    <>
      {/* Success / error feedback as chat bubbles */}
      {state === 'success' && (
        <div className="chat-bubble received chat-bubble--success">
          <p>Calling card received! I'll get back to you soon.</p>
        </div>
      )}
      {state === 'error' && (
        <div className="chat-bubble received chat-bubble--error">
          <p>{errorMsg}</p>
        </div>
      )}

      <form className="chat-form" onSubmit={handleSubmit}>
        {/* Web3Forms access key — must be a hidden field in the form */}
        <input type="hidden" name="access_key" value={ACCESS_KEY} />
        {/* Subject line for the email */}
        <input type="hidden" name="subject" value="New Contact from Portfolio" />
        {/* Send from name */}
        <input type="hidden" name="from_name" value="Portfolio Contact Form" />
        {/* Honeypot spam field (hidden from users, caught by Web3Forms) */}
        <input type="checkbox" name="botcheck" className="sr-only" tabIndex={-1} autoComplete="off" />

        <div className="form-row">
          <label htmlFor="contact-name">Name</label>
          <input
            type="text"
            id="contact-name"
            name="name"
            placeholder="Your codename..."
            required
            autoComplete="name"
            disabled={state === 'sending'}
          />
        </div>
        <div className="form-row">
          <label htmlFor="contact-email">Email</label>
          <input
            type="email"
            id="contact-email"
            name="email"
            placeholder="phantom@example.com"
            required
            autoComplete="email"
            disabled={state === 'sending'}
          />
        </div>
        <div className="form-row">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Write your calling card..."
            rows={4}
            required
            minLength={10}
            disabled={state === 'sending'}
          />
        </div>
        <button
          type="submit"
          className="p5-send-btn"
          disabled={state === 'sending'}
        >
          {state === 'sending' ? 'Sending...' : 'Send Calling Card'}
        </button>
      </form>
    </>
  );
}
