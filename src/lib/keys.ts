/* sessionStorage key: intro gate already played this session (read by layout.tsx's inline script and <Gate>) */
export const GATE_KEY = 'ryonne:gate';

/** "Book this repair" in <Diagnose> → <SpecForm> fills "Damaged glass" + "Message" */
export const PREFILL_EVENT = 'ryonne:prefill';
export type Prefill = { glass: string; message: string };
