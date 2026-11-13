'use client';
/* =========================================================
   Fleet — one night at the depot, hour by hour.
   The screen stays put while you scroll from 21:00 to 07:00: the big
   clock rolls to the next time, the next photo wipes up over the last
   one, a red marker runs along the hour ruler, and the sky behind
   slowly warms up from night to dawn.
   ========================================================= */
import { useRef, useState } from 'react';
import Image from 'next/image';
import Rich from './Rich';
import { env, gsap, ScrollTrigger, useGsap } from '@/lib/motion';
import { fleetPage } from '@/lib/site';

const d = fleetPage.night;
const n = d.steps.length;
const at = (h: number) => (h - d.from) / (d.to - d.from);           // 0..1 on the ruler
const hours = Array.from({ length: d.to - d.from + 1 }, (_, i) => d.from + i);

export default function FleetNight() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGsap(() => {
    const root = ref.current!;
    const shots = [...root.querySelectorAll<HTMLElement>('.fn__shot')];
    const marker = root.querySelector<HTMLElement>('.fn__marker')!;
    const reduce = env().reduce;
    gsap.from(root.querySelectorAll('.fn__head > *'), { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
    ScrollTrigger.create({
      trigger: root, start: 'top top', end: 'bottom bottom',
      snap: reduce ? undefined : { snapTo: 1 / (n - 1), duration: { min: .3, max: .8 }, delay: .1, ease: 'power2.inOut' },
      onUpdate: s => {
        const a = s.progress * (n - 1);
        setActive(Math.round(a));
        shots.forEach((el, i) => {
          if (i === 0) return;
          const t = gsap.utils.clamp(0, 1, a - (i - 1));
          el.style.clipPath = `inset(${(1 - t) * 100}% 0 0 0)`;
          gsap.set(el.querySelector('img'), { scale: 1.18 - .18 * t });
        });
        const i0 = Math.min(n - 2, Math.floor(a)), f = a - i0;
        const pos = at(d.steps[i0].h) + (at(d.steps[i0 + 1].h) - at(d.steps[i0].h)) * f;
        marker.style.left = `${pos * 100}%`;
        root.style.setProperty('--dawn', String(s.progress));
      },
    });
  }, []);

  const roll = (i: number) => (i < active ? ' is-up' : i > active ? ' is-down' : ' is-on');

  return (
    <section className="fn" ref={ref}>
      <div className="fn__stage">
        <span className="fn__sky" aria-hidden="true"></span>
        <header className="fn__head">
          <span className="mono"><i></i>{d.kicker}</span>
          <h2 className="h-wide"><Rich text={d.title} /></h2>
        </header>

        <div className="fn__copy">
          <div className="fn__time h-wide" aria-hidden="true">
            {d.steps.map((s, i) => <b key={s.time} className={'fn__roll' + roll(i)}><i>{s.time}</i></b>)}
          </div>
          <div className="fn__step">
            {d.steps.map((s, i) => (
              <div key={s.time} className={'fn__txt' + roll(i)} aria-hidden={i !== active}>
                <h3 className="h-wide"><span><i>{s.title}</i></span></h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fn__shots">
          {d.steps.map((s, i) => (
            <figure className="fn__shot" key={s.time} style={i ? { clipPath: 'inset(100% 0 0 0)' } : undefined}>
              <Image src={s.img.src} width={s.img.w} height={s.img.h} alt="" sizes="(max-width: 980px) 90vw, 52vw" />
            </figure>
          ))}
          <span className="fn__count mono">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </div>

        <div className="fn__ruler" aria-hidden="true">
          {hours.map(h => (
            <span key={h} className="fn__tick" style={{ left: `${at(h) * 100}%` }}>
              <span className="mono">{String(h % 24).padStart(2, '0')}</span>
            </span>
          ))}
          {d.steps.map((s, i) => <span key={s.time} className={'fn__dot' + (i <= active ? ' is-on' : '')} style={{ left: `${at(s.h) * 100}%` }}></span>)}
          <span className="fn__marker"></span>
        </div>
      </div>
    </section>
  );
}
