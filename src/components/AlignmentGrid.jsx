const STEPS = [0, 0.5, 1];
const ROWS = ["Top", "Middle", "Bottom"];
const COLS = ["left", "center", "right"];

const labelFor = (row, col) => (row === 1 && col === 1 ? "Center" : `${ROWS[row]} ${COLS[col]}`);

// 3 x 3 radio grid: where the logo sits inside its area.
export default function AlignmentGrid({ ax, ay, onChange }) {
  const selectedCol = STEPS.indexOf(ax);
  const selectedRow = STEPS.indexOf(ay);

  const onKeyDown = (event) => {
    const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const row = Math.min(2, Math.max(0, selectedRow + move[0]));
    const col = Math.min(2, Math.max(0, selectedCol + move[1]));
    onChange(STEPS[col], STEPS[row]);
    event.currentTarget.querySelector(`[data-pos="${row}-${col}"]`)?.focus();
  };

  return (
    <div className="align-grid" role="radiogroup" aria-label="Logo alignment" onKeyDown={onKeyDown}>
      {ROWS.map((_, row) => COLS.map((__, col) => {
        const checked = row === selectedRow && col === selectedCol;
        return (
          <button
            key={`${row}-${col}`}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={labelFor(row, col)}
            title={labelFor(row, col)}
            data-pos={`${row}-${col}`}
            tabIndex={checked ? 0 : -1}
            className={checked ? "is-selected" : ""}
            onClick={() => onChange(STEPS[col], STEPS[row])}
          ><span /></button>
        );
      }))}
    </div>
  );
}
