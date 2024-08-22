import Plot from "react-plotly.js";
function Visual_2_heatmap(props) {
  // Heatmap data
  let data = [{ z: props.data, colorscale: props.color, type: "heatmap" }];

  // Markers data
  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#c7c7c7",
    "#dbdb8d",
    "#9edae5",
    "#393b79",
    "#637939",
    "#8c6d31",
    "#843c39",
    "#7b4173",
    "#5254a3",
    "#8ca252",
    "#bd9e39",
    "#ad494a",
    "#a55194",
  ];
  let markersData = [];
  if (props.markers.length != 0) {
    markersData = props.markers.map((marker, inx) => {
      return {
        x: [marker.y],
        y: [marker.x],
        mode: "markers",
        type: "scatter",
        marker: {
          color: colors[inx], // Use your list of colors here
        },
      };
    });
  }

  // full data
  let all_data = [...data, ...markersData];
  let config = {
    modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
    displayModeBar: true,
    scrollZoom: true,
  };
  let layout = {
    width: 650,
    // height: 700,
    showlegend: false,
    // dragmode: "false",
  };

  function handleClick(event) {
    const point = event.points[0];
    props.fetchPointWavelenghts(point.y, point.x);
  }

  return (
    <>
      {props.data.length == 0 ? (
        <div className="loader_ld1 mt-20 ml-20 text-center">
          {/* <span className="loader_gs"></span> */}
        </div>
      ) : (
        <div>
          <Plot
            data={all_data}
            config={config}
            layout={layout}
            onClick={handleClick}
          />
        </div>
      )}
    </>
  );
}

export default Visual_2_heatmap;
