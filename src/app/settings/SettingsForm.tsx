'use client';

import { useActionState } from 'react';
import { updateProfile, type SettingsFormState } from '@/app/actions/profile';
import { useI18n } from '@/components/I18nProvider';
import { EMIRATES } from '@/lib/constants';
import type { Profile } from '@/lib/types';

const initialState: SettingsFormState = { error: null, success: false };

export default function SettingsForm({ profile }: { profile: Profile }) {
  const { dict, locale } = useI18n();
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <>
      <form action={formAction}>
        <div className="section-label">{dict.settings.profileSection}</div>
        <div className="field">
          <label htmlFor="display_name">{dict.welcome.displayName}</label>
          <input
            id="display_name"
            name="display_name"
            required
            minLength={2}
            maxLength={40}
            defaultValue={profile.display_name}
          />
        </div>
        <div className="field">
          <label htmlFor="phone">{dict.welcome.phone}</label>
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            defaultValue={profile.phone}
          />
          <p className="hint">{dict.welcome.phoneHint}</p>
        </div>
        <div className="field">
          <label htmlFor="emirate">{dict.welcome.emirate}</label>
          <select id="emirate" name="emirate" required defaultValue={profile.emirate}>
            {EMIRATES.map((e) => (
              <option key={e} value={e}>
                {dict.emirates[e]}
              </option>
            ))}
          </select>
        </div>
        {state.error && <p className="form-error">{state.error}</p>}
        {state.success && !pending && <p className="form-success">{dict.settings.saved}</p>}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? dict.settings.saving : dict.settings.save}
        </button>
      </form>

      <div className="section-label">{dict.settings.languageSection}</div>
      <div className="field">
        <label>{dict.settings.language}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="/locale/en?back=/settings"
            className={`chip ${locale === 'en' ? 'active' : ''}`}
          >
            {dict.settings.english}
          </a>
          <a
            href="/locale/ar?back=/settings"
            className={`chip ${locale === 'ar' ? 'active' : ''}`}
          >
            {dict.settings.arabic}
          </a>
        </div>
      </div>
    </>
  );
}
