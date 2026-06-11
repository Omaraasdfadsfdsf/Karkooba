'use client';

import { useActionState } from 'react';
import { saveProfile, type ProfileFormState } from '@/app/actions/profile';
import { useI18n } from '@/components/I18nProvider';
import { EMIRATES } from '@/lib/constants';

const initialState: ProfileFormState = { error: null };

export default function ProfileForm({ next }: { next: string }) {
  const { dict } = useI18n();
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="display_name">{dict.welcome.displayName}</label>
        <input
          id="display_name"
          name="display_name"
          required
          minLength={2}
          maxLength={40}
          placeholder={dict.welcome.displayNamePh}
        />
        <p className="hint">{dict.welcome.displayNameHint}</p>
      </div>
      <div className="field">
        <label htmlFor="phone">{dict.welcome.phone}</label>
        <input
          id="phone"
          name="phone"
          required
          inputMode="tel"
          placeholder={dict.welcome.phonePh}
          dir="ltr"
        />
        <p className="hint">{dict.welcome.phoneHint}</p>
      </div>
      <div className="field">
        <label htmlFor="emirate">{dict.welcome.emirate}</label>
        <select id="emirate" name="emirate" required defaultValue="">
          <option value="" disabled>
            {dict.welcome.pickOne}
          </option>
          {EMIRATES.map((e) => (
            <option key={e} value={e}>
              {dict.emirates[e]}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="form-error">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? dict.welcome.saving : dict.welcome.save}
      </button>
    </form>
  );
}
