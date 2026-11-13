'use client';
/* "Define your glass" quote form (home + contact).
   Submits to the submitQuote Server Action; shows loading / success / error. */
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import Rich from './Rich';
import { qa, revealUp, useGsap } from '@/lib/motion';
import { business, quoteForm as f } from '@/lib/site';
import { submitQuote, type QuoteState } from '@/app/actions';
import { PREFILL_EVENT, type Prefill } from '@/lib/keys';

type Props = { defaultService?: string; defaultMessage?: string };

export default function SpecForm({ defaultService = 'mobile', defaultMessage = '' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: 'idle' });
  const err = (k: string) => state.errors?.[k];

  useGsap(() => {
    const root = ref.current!;
    // Status lines are left out: they start at opacity 0 in CSS, so a gsap.from()
    // would lock them at inline opacity 0 and the success message could never show
    // (bug inherited from the static site's main.js).
    revealUp([...qa('.spec__sticky > *', root), ...qa('.spec__form > *:not(.spec__ok):not(.spec__err)', root)]);
  }, []);

  // Clear the form after a successful send (but keep input on errors)
  useEffect(() => {
    if (state.status === 'success') { formRef.current?.reset(); setFileName(null); }
  }, [state]);

  // Pre-fill from the 3D diagnosis ("Book this repair" in <Diagnose>)
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { glass, message } = (e as CustomEvent<Prefill>).detail;
      const form = formRef.current; if (!form) return;
      const sel = form.elements.namedItem('glass') as HTMLSelectElement | null;
      const msg = form.elements.namedItem('message') as HTMLTextAreaElement | null;
      if (sel) sel.value = glass;
      if (msg) msg.value = message;
      form.classList.remove('is-prefilled'); void form.offsetWidth; form.classList.add('is-prefilled');
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  // Focus the first invalid field
  useEffect(() => {
    if (state.status === 'error' && state.errors) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // manual submit = no automatic form reset on error
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  // Field error, linked to its input via aria-describedby
  const fieldErr = (k: string) => err(k) ? <em className="spec__fielderr" id={`err-${k}`}>{err(k)}</em> : null;
  const a11y = (k: string) => ({ 'aria-invalid': err(k) ? true : undefined, 'aria-describedby': err(k) ? `err-${k}` : undefined });

  return (
    <section className="spec" id="contact" ref={ref}>
      <div className="spec__left">
        <div className="spec__sticky">
          <span className="eyebrow">{f.eyebrow}</span>
          <h2 className="h-wide"><Rich text={f.title} /></h2>
          <p>{f.text}</p>
          <a href={`tel:${business.tel}`} className="spec__phone h-serif">{business.phone}</a>
        </div>
      </div>
      <form className={`spec__form${state.status === 'success' ? ' is-sent' : ''}`} ref={formRef} onSubmit={onSubmit} encType="multipart/form-data">
        <label><span>Full name</span><input type="text" name="name" placeholder="John Doe" required autoComplete="name" {...a11y('name')} />{fieldErr('name')}</label>
        <label><span>Preferred method of contact</span><select name="contact_method" defaultValue=""><option value="">Please choose an option</option>{f.contactMethods.map(m => <option key={m}>{m}</option>)}</select></label>
        <label><span>Email address</span><input type="email" name="email" placeholder="john.doe@example.com" required autoComplete="email" {...a11y('email')} />{fieldErr('email')}</label>
        <label><span>Phone number</span><input type="tel" name="phone" placeholder="(614) 000-0000" autoComplete="tel" {...a11y('phone')} />{fieldErr('phone')}</label>
        <label><span>Vehicle</span><input type="text" name="vehicle" placeholder="2021 Honda Civic" /></label>
        <label><span>Damaged glass</span><select name="glass" defaultValue={f.glass[0]}>{f.glass.map(g => <option key={g}>{g}</option>)}</select></label>
        <fieldset className="spec__radio"><legend>Preferred service</legend>
          {f.services.map(s => <label key={s.value}><input type="radio" name="service" value={s.value} defaultChecked={s.value === defaultService} /><i></i>{s.label}</label>)}
        </fieldset>
        <label className="spec__upload"><span>Photo of the damage <small>Optional</small></span>
          <div className="drop">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v12m0-12-4 4m4-4 4 4" /></svg>
            <b>{fileName ?? 'Click to upload or drag and drop'}</b><small>JPG, PNG up to 10MB</small>
            <input type="file" name="photo" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) setFileName(file.name); }} {...a11y('photo')} />
          </div>
          {fieldErr('photo')}
        </label>
        <label className="spec__full"><span>Message <small>Optional</small></span><textarea name="message" rows={4} placeholder="Tell us what happened to your glass…" defaultValue={defaultMessage} {...a11y('message')} />{fieldErr('message')}</label>
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" hidden aria-hidden="true" />
        <button type="submit" className="btn btn--line spec__submit" data-magnetic disabled={pending}>{pending ? 'Sending…' : 'Submit enquiry'}</button>
        <p className="spec__err" role="alert">{state.status === 'error' ? state.message : ''}</p>
        <p className="spec__ok" role="status">{f.success}</p>
      </form>
    </section>
  );
}
