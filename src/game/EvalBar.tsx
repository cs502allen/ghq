export default function EvalBar({ evalValue }: { evalValue: number }) {
  const width = evalToWidth(evalValue);

  function evalToWidth(evalScore: number) {
    var a = 0.05;
    var width = 50 * (1 + Math.tanh(a * evalScore));
    return width;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "20px",
        backgroundColor: "var(--blue)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}%`,
          height: "100%",
          backgroundColor: "var(--red)",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          width: "100%",
          fontWeight: "bold",
        }}
      >
        {evalValue}
      </div>
    </div>
  );
}
