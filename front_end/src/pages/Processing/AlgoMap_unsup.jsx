import Plot from "react-plotly.js";
import { MdRestartAlt } from "react-icons/md";

// function calculateCounts(arr) {
//   // Flatten the 2D array into a 1D array
//   let flatArray = arr.flat();
//   let counts = {};

//   // Count occurrences of each unique value
//   flatArray.forEach((value) => {
//     counts[value] = (counts[value] || 0) + 1;
//   });
//   return Object.keys(counts)
//     .sort((a, b) => a - b) // Sort keys numerically
//     .map((key) => counts[key]);
// }
const ClassificationHeatmapUpsup = (props) => {
  // let classNames = ["Unknown", ...props.heatmapData.classNames];
  const clusters = Array.from(new Set(props.heatmapData["data_z"].flat())).sort(
    (a, b) => a - b
  );
  const data_z = props.heatmapData["data_z"];
  let algo_name = props.algo_name;
  if (algo_name == "KM") {
    algo_name = "K-MEANS";
  }

  const colors = [
    "#000000",
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
  let colorscale = clusters.map((c, i) => [
    i / (clusters.length - 1),
    colors[i],
  ]);
  //   console.log(classNames);
  //   console.log(colorscale);
  //   colorscale= ["unk"]

  // const data_z_sorted = data_z.map((row) => [...row].sort((a, b) => b - a));
  // const counts_values = calculateCounts(data_z);

  // var data_pie = [
  //   {
  //     type: "pie",
  //     values: counts_values,
  //     labels: classNames,
  //     marker: {
  //       colors: colors.slice(0, counts_values.length), // Custom colors for each label
  //     },
  //     textinfo: "label+percent",
  //     textposition: "outside",
  //     automargin: true,
  //   },
  // ];
  const plot_data = [
    {
      z: data_z,
      type: "heatmap",
      colorscale: colorscale,
      //   colorscale: colorscale,
      showscale: false,
    },
    ...clusters.map((name, i) => ({
      x: [null],
      y: [null],
      mode: "markers",
      marker: { size: 10, color: colors[i] },
      legendgroup: "Class " + name,
      showlegend: true,
      name: "Class " + name,
    })),
  ];

  // const plot_data = [
  //   {
  //     z: data_z,
  //     type: "heatmap",
  //     colorscale: colorscale,
  //     //   colorscale: colorscale,
  //     showscale: false,
  //   },
  // ];

  let config = {
    modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
    displayModeBar: true,
    // scrollZoom: true,
  };

  // const layout = {
  //   // title: "Classification Results SAM",
  //   width: 500,
  //   height: 800,
  //   xaxis: { showgrid: true, zeroline: true, visible: true },
  //   yaxis: {
  //     showgrid: true,
  //     zeroline: true,
  //     visible: true,
  //     autorange: "reversed",
  //   },
  // };

  const layout = {
    // title: "Classification Results SAM",
    // width: 350,
    // height: 800,
    xaxis: { showgrid: true, zeroline: true, visible: true },
    yaxis: {
      showgrid: true,
      zeroline: true,
      visible: true,
      autorange: "reversed",
    },
  };

  // var layout_pie = {
  //   // height: 500,
  //   width: 500,
  //   margin: { t: 0, b: 0, l: 0, r: 0 },
  //   showlegend: false,
  // };

  const handleClick = (event) => {
    // console.log("clicked");
    props.newRun();
  };
  return (
    <>
      <div className="text-left">
        {/* <Link to="/Processing/Category 1"> */}
        <button
          onClick={handleClick}
          type="button"
          class="mb-2 py-2 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-sm border border-transparent bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          New Run
          <MdRestartAlt size={21} />
        </button>
        {/* </Link> */}
      </div>
      <div className="w-[80%] mx-auto text-center py-5 mb-8 mt-3 text-xl border shadow">
        {" "}
        Results of <span className="font-bold">{algo_name}</span>
      </div>
      {/* <Plot
        data={data}
        //   config={config}
        layout={layout}
        config={config}
        //   onClick={handleClick}
      /> */}
      <div className="text-center">
        <Plot
          data={plot_data}
          //   config={config}
          layout={layout}
          config={config}
          //   onClick={handleClick}
        />
      </div>

      {/* <div className="text-center mt-[-80px]">
        <Plot
          data={data_pie}
          //   config={config}
          layout={layout_pie}
          // config={config}
          //   onClick={handleClick}
        />
      </div> */}
    </>
  );
};

export default ClassificationHeatmapUpsup;
