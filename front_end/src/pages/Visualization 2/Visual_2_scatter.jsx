import Plot from "react-plotly.js";

function Visual_2_scatter(props) {
  let traces = props.traces;

  let layaout = {
    width: 630,
    height: 400,
    showlegend: true,
    title: "Spectral Signatures in MWIR range",
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

export default Visual_2_scatter;
