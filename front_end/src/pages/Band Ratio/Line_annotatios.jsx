import Plot from "react-plotly.js";

function Line_annotations(props) {
  //   let traces = props.traces;

  //   console.log(props.maxMarkers);

  var traceMean = {
    x: props.meanTrace[0],
    y: props.meanTrace[1],
    mode: "line",
    name: "Mean",
    line: {
      color: "black",
      width: 2,
    },
  };

  //   var
  var traceMin = {
    x: props.minMarkers[0],
    y: props.minMarkers[1].map((x) => props.meanTrace[1][x]), //props.meanTrace[1][],
    mode: "markers",
    name: "Min",
    marker: {
      color: "orange",
      size: 10,
    },
  };

  var traceMax = {
    x: props.maxMarkers[0],
    y: props.maxMarkers[1].map((x) => props.meanTrace[1][x]),
    mode: "markers",
    name: "Max",
    marker: {
      color: "blue",
      size: 10,
    },
  };

  var traces = [traceMean, traceMin, traceMax];

  let layaout = {
    width: 700,
    height: 400,
    showlegend: true,
    // title: "Mean Spectral Signature in MWIR range",
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
    <div>
      <Plot data={traces} layout={layaout} config={config} />
    </div>
  );
}

export default Line_annotations;
