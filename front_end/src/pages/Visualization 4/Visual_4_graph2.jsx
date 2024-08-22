import Plot from "react-plotly.js";
import { useState, useEffect } from "react";

function Visual_4_graph2(props) {
  var x_list = [];
  for (var x = 0; x < props.pixelsWaveXvalues.length; x++) {
    x_list.push(x);
  }
  // console.log(x_list);
  let traces = [
    {
      x: x_list,
      y: props.pixelsWaveXvalues,
      type: "lines",
      line: {
        // color: "rgb(142, 68, 173)",
        width: 2,
      },
    },
  ];

  // useEffect(() => {}, []);

  // console.log(traces);

  let layaout = {
    width: 630,
    height: 400,
    title: "Pixels Intensities",
    xaxis: {
      title: "Pixels",
    },
    yaxis: {
      title: "Intensities",
    },

    showlegend: false,
  };

  let config = {
    displayModeBar: true,
    modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
  };

  return (
    <>
      <div className="mt-5">
        <Plot data={traces} layout={layaout} config={config} />
      </div>
    </>
  );
}

export default Visual_4_graph2;
