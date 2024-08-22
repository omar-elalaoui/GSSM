import Plot from "react-plotly.js";
function Heatmap(props) {
  let data = [
    {
      z: props.data,
      colorscale: props.color,
      type: "heatmap",
    },
  ];
  let config = {
    modeBarButtonsToRemove: ["AutoScale2d"],
    displayModeBar: true,
  };

  let layout = {
    width: 650,
    // height: 700,
    dragmode: "false",
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
        <div
        // style={{ border: "1px solid black" }}
        >
          <Plot
            data={data}
            config={config}
            layout={layout}
            onClick={handleClick}
          />
        </div>
      )}
    </>
  );
}

export default Heatmap;
