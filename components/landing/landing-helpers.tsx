import { chartData, qrPattern } from "./landing-data";

export function QrDots({ color = "#173D28" }: { color?: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 7px)",
        gridTemplateRows: "repeat(5, 7px)",
        gap: 2,
      }}
    >
      {qrPattern.map((v, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 1,
            background: v ? color : "transparent",
          }}
        />
      ))}
    </div>
  );
}

export function ChartBars() {
  return (
    <>
      {chartData.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              height: `${d.r}%`,
              background: "#1B5E3C",
              borderRadius: "4px 4px 0 0",
            }}
          />
          <div
            style={{
              flex: 1,
              height: `${d.e}%`,
              background: "#DED9CD",
              borderRadius: "4px 4px 0 0",
            }}
          />
        </div>
      ))}
    </>
  );
}

export function CheckIcon() {
  return (
    <span
      style={{
        flex: "0 0 auto",
        width: 20,
        height: 20,
        borderRadius: 6,
        background: "#E7F3EC",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
      }}
    >
      <span
        style={{
          width: 9,
          height: 5,
          borderLeft: "2px solid #1B5E3C",
          borderBottom: "2px solid #1B5E3C",
          transform: "rotate(-45deg)",
          marginTop: -2,
        }}
      />
    </span>
  );
}
