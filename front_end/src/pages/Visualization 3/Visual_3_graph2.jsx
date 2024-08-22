import Plot from "react-plotly.js";
import Plotly from "plotly.js/dist/plotly";
import React from "react";
function Visual_3_graph2(props) {
  // Heatmap data

  console.log(props.dataForGraph2);

  let data = [
    {
      z: props.dataForGraph2,
      // colorscale: props.color,
      type: "heatmap",
    },
  ];
  let config = {
    modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
    displayModeBar: true,
    scrollZoom: true,
  };
  let layout = {
    width: 600,
    title: "Region of interest pixels intensities",
    // height: 700,
    showlegend: false,
    // dragmode: "false",
  };

  // function clearAll() {
  //   props.clearPoints();
  // }
  return (
    <>
      {props.dataForGraph2.length == 0 ? (
        <div className="loader mt-20 text-center">
          <span className="loader_gs"></span>
        </div>
      ) : (
        <div>
          <Plot data={data} config={config} layout={layout} />
        </div>
      )}
    </>
  );
}

export default React.memo(Visual_3_graph2);
