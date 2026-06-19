export interface BarDatum {
  key: string;
  value: number;
  topLabel?: string;
  bottomLabel?: string;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  emptyLabel: string;
}

export function BarChart({ data, emptyLabel }: BarChartProps) {
  const max = data.reduce((peak, datum) => Math.max(peak, datum.value), 0);

  if (max <= 0) {
    return <p className="text-sm text-copy-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex h-44 items-end gap-1.5">
      {data.map((datum) => {
        const height = datum.value > 0 ? Math.max(4, (datum.value / max) * 100) : 0;
        return (
          <div
            key={datum.key}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
          >
            {datum.topLabel ? (
              <span className="text-[0.65rem] tabular-nums text-copy-muted">
                {datum.topLabel}
              </span>
            ) : null}
            <div
              className={
                datum.highlight
                  ? "w-full rounded-t-md bg-brand"
                  : "w-full rounded-t-md bg-accent"
              }
              style={{ height: `${height}%` }}
            />
            {datum.bottomLabel ? (
              <span className="text-[0.65rem] tabular-nums text-copy-muted">
                {datum.bottomLabel}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
