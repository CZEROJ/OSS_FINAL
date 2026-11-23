export function Icon({ name }) {
  return <img className="icon" src={`/planner/${name}.svg`} alt="" aria-hidden="true" />;
}

export function Segments({ options, selected, onChange, label }) {
  return <div className="segments" role="group" aria-label={label}>
    {options.map(option => <button key={option} type="button" aria-pressed={selected === option} onClick={() => onChange(option)}>{option}</button>)}
  </div>;
}
