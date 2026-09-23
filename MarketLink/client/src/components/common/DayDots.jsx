import { DAY_LETTER, DAY_NAMES } from '../../utils/format';

/** S M T W T F S - highlighted days are open */
export default function DayDots({ days = [] }) {
  return (
    <span className="day-dots" aria-label={`Open on ${days.map((d) => DAY_NAMES[d]).join(', ') || 'no days'}`}>
      {DAY_LETTER.map((letter, i) => (
        <span key={i} className={`d ${days.includes(i) ? 'on' : ''}`} title={DAY_NAMES[i]}>
          {letter}
        </span>
      ))}
    </span>
  );
}
