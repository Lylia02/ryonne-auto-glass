import { Fragment } from 'react';

/** Renders site.ts strings: *word* → <em>word</em>, \n → <br> */
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*]+\*)/).map((part, j) =>
            part.startsWith('*') && part.endsWith('*') && part.length > 2
              ? <em key={j}>{part.slice(1, -1)}</em>
              : part)}
        </Fragment>
      ))}
    </>
  );
}
