'use server';
/* Quote form → validated with zod → forwarded to Formspree.
   Endpoint: FORMSPREE_ENDPOINT in .env.local (see README). */
import { z } from 'zod';
import { quoteForm } from '@/lib/site';

export type QuoteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Partial<Record<string, string>>;
};

const MAX_FILE = 10 * 1024 * 1024; // 10MB, as stated on the upload field
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = '(614) 973-3385';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  contact_method: z.enum(['', ...quoteForm.contactMethods] as [string, ...string[]]).catch(''),
  email: z.string().trim().min(1, 'We need an email to send your quote.').max(200).regex(EMAIL_RE, 'That email doesn’t look right.'),
  phone: z.string().trim().max(30).catch(''),
  vehicle: z.string().trim().max(120).catch(''),
  glass: z.enum(quoteForm.glass as [string, ...string[]]).catch('Not sure'),
  service: z.enum(quoteForm.services.map(s => s.value) as [string, ...string[]]).catch('mobile'),
  message: z.string().trim().max(3000, 'Please keep the message under 3000 characters.').catch(''),
}).superRefine((d, ctx) => {
  const digits = d.phone.replace(/\D/g, '');
  if (!digits && (d.contact_method === 'Phone' || d.contact_method === 'Text'))
    ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Add a phone number so we can call or text you.' });
  else if (digits && (digits.length < 10 || digits.length > 15))
    ctx.addIssue({ code: 'custom', path: ['phone'], message: `Please enter a full phone number, e.g. ${PHONE}.` });
});

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  // Honeypot: bots fill every field — pretend it worked
  if (formData.get('_gotcha')) return { status: 'success' };

  const raw = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string'));
  const parsed = schema.safeParse(raw);
  const errors: Record<string, string> = {};
  if (!parsed.success) for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;

  const photo = formData.get('photo');
  const file = photo instanceof File && photo.size > 0 ? photo : null;
  if (file && !file.type.startsWith('image/')) errors.photo = 'Please attach an image (JPG or PNG).';
  else if (file && file.size > MAX_FILE) errors.photo = 'That photo is over 10MB — please choose a smaller one.';

  if (!parsed.success || Object.keys(errors).length) return { status: 'error', message: 'Please check the highlighted fields.', errors };

  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) {
    console.error('[quote] FORMSPREE_ENDPOINT is not set — see README');
    return { status: 'error', message: `Online booking isn’t live yet. Please call ${PHONE} or email info@ryonneautoglass.com.` };
  }

  const body = new FormData();
  for (const [k, v] of Object.entries(parsed.data)) body.append(k, v);
  body.append('_subject', `Quote request — ${parsed.data.name} (${parsed.data.glass})`);
  if (file) body.append('photo', file, file.name);

  try {
    const res = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (res.ok) return { status: 'success' };
    const data = (await res.json().catch(() => null)) as { errors?: { message: string }[] } | null;
    console.error('[quote] Formspree error', res.status, data);
    return { status: 'error', message: data?.errors?.length ? data.errors.map(e => e.message).join(' ') : `Something went wrong sending your enquiry. Please try again, or call ${PHONE}.` };
  } catch (err) {
    console.error('[quote] network error', err);
    return { status: 'error', message: `We couldn’t reach the server. Please try again, or call ${PHONE}.` };
  }
}
