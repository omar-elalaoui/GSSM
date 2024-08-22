import Plot from "react-plotly.js";

function Visual_1_scatter(props) {
  let trace = {
    x: props.waves,
    y: props.wavesValues,
    type: "scatter",
  };

  let layaout = {
    width: 630,
    height: 400,
    title: "Spectral Signatures in MWIR range",
    xaxis: {
      title: "Wavelengths",
    },
    yaxis: {
      title: "Reflectance",
    },
  };

  let config = {
    displayModeBar: true,
    modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
  };

  return (
    <div
    // style={{ border: "1px solid black" }}
    >
      <Plot data={[trace]} layout={layaout} config={config} />
    </div>
  );
}

export default Visual_1_scatter;
