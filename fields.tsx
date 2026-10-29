import type { ReactNode } from 'react';

export function Text({ label, value, onChange, multiline, hint }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string }) {
  return (
    <label className="field">
      <span>{label}{hint && <small> {hint}</small>}</span>
      {multiline ? <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        : <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export function Section({ title, children, help }: { title: string; children: ReactNode; help?: string }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {help && <p className="muted">{help}</p>}
      {children}
    </section>
  );
}

// Editable list of objects. `make` creates a new empty item.
export function ListEditor<T>({ items, onChange, make, render, addLabel }: {
  items: T[]; onChange: (items: T[]) => void; make: () => T; render: (item: T, set: (i: T) => void, index: number) => ReactNode; addLabel: string;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="list">
      {items.map((item, i) => (
        <div className="list-item" key={i}>
          <div className="list-bar">
            <span className="muted">#{i + 1}</span>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
            <button type="button" className="danger" onClick={() => { if (confirm('Delete this item?')) onChange(items.filter((_, k) => k !== i)); }}>Delete</button>
          </div>
          {render(item, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, make()])}>+ {addLabel}</button>
    </div>
  );
}

// Editable list of plain strings.
export function StringList({ items, onChange, addLabel }: { items: string[]; onChange: (v: string[]) => void; addLabel: string }) {
  return (
    <ListEditor<string>
      items={items}
      onChange={onChange}
      make={() => ''}
      addLabel={addLabel}
      render={(v, set) => <input value={v} onChange={(e) => set(e.target.value)} />}
    />
  );
}
