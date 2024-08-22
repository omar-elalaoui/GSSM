import Plot from "react-plotly.js";

function Scatter(props) {
  let trace = {
    x: props.waves,
    y: props.wavesValues,
    type: "scatter",
  };

  let layaout = {
    width: 630,
    title: props.title,
    xaxis: {
      title: "Wavelengths",
    },
    yaxis: {
      title: "Reflectance",
    },
    // height: 400,
  };

  let config = {
    displayModeBar: false,
    // modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
  };

  return (
    <div
    // style={{ border: "1px solid black" }}
    >
      <Plot data={[trace]} layout={layaout} config={config} />
    </div>
  );
}

export default Scatter;
