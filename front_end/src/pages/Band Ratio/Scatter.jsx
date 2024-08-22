import Plot from "react-plotly.js";

function Scatter(props) {
  let traces = props.traces;
  if (traces.length > 1) {
    traces = [...traces, props.meanTraces];
  }

  let layaout = {
    width: 630,
    height: 400,
    showlegend: true,
    // title: "Mean Spectral Signature in MWIR range",
    xaxis: {
      title: "Wavelengths",
    },
    yaxis: {
      title: "Reflectance",
    },
    // showlegend: false,
    // margin: { t: 0 },
  };

  let config = {
    displayModeBar: true,
    modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
  };
  return (
    <div>
      <Plot data={traces} layout={layaout} config={config} />
    </div>
  );
}

export default Scatter;
