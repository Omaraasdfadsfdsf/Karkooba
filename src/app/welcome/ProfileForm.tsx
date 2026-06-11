'use client';

import { useActionState } from 'react';
import { saveProfile, type ProfileFormState } from '@/app/actions/profile';
import { EMIRATES } from '@/lib/constants';

const initialState: ProfileFormState = { error: null };

export default function ProfileForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="display_name">Display name</label>
        <input
          id="display_name"
          name="display_name"
          required
          minLength={2}
          maxLength={40}
          placeholder="e.g. Abu Karkooba"
        />
        <p className="hint">First name, nickname, whatever — buyers just need something to call you.</p>
      </div>
      <div className="field">
        <label htmlFor="phone">WhatsApp number</label>
        <input
          id="phone"
          name="phone"
          required
          inputMode="tel"
          placeholder="0501234567"
        />
        <p className="hint">Buyers message you directly on WhatsApp. We&apos;ll format it as 971… automatically.</p>
      </div>
      <div className="field">
        <label htmlFor="emirate">Your emirate</label>
        <select id="emirate" name="emirate" required defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          {EMIRATES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? 'Saving…' : "Done — let's sell →"}
      </button>
    </form>
  );
}
