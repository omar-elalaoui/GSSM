import Plot from "react-plotly.js";
import { MdRestartAlt } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";

import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function calculateCounts(arr) {
  // Flatten the 2D array into a 1D array
  let flatArray = arr.flat();
  let counts = {};

  // Count occurrences of each unique value
  flatArray.forEach((value) => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.keys(counts)
    .sort((a, b) => a - b) // Sort keys numerically
    .map((key) => counts[key]);
}
const ClassificationHeatmap = (props) => {
  const pdfRef = useRef();
  let classNames = ["Unclassified", ...props.heatmapData.classNames];
  let algo_name = props.algo_name;
  if (algo_name == "ML") {
    algo_name = "Maximum Likelihood";
  } else if (algo_name == "MD") {
    algo_name = "Minimum Distance";
  }
  //   console.log(new Set(props.heatmapData.data_z.flat()));
  //   const colors = ["#636EFA", "#EF553B", "#00CC96", "#AB63FA"];

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
  let colorscale = classNames.map((c, i) => [
    i / (classNames.length - 1),
    colors[i],
  ]);
  //   console.log(classNames);
  //   console.log(colorscale);
  //   colorscale= ["unk"]

  const data_z_original = props.heatmapData.data_z_original;
  console.log(data_z_original);
  const data_z = props.heatmapData.data_z;
  const data_z_sorted = data_z.map((row) => [...row].sort((a, b) => b - a));
  const counts_values = calculateCounts(data_z);

  var data_pie = [
    {
      type: "pie",
      values: counts_values,
      labels: classNames,
      marker: {
        colors: colors.slice(0, counts_values.length), // Custom colors for each label
      },
      textinfo: "label+percent",
      textposition: "outside",
      automargin: true,
    },
  ];
  const data_orig = [
    {
      z: data_z_original,
      type: "heatmap",
      colorscale: "Viridis",
      //   colorscale: colorscale,
      showscale: false,
    },
  ];
  const data = [
    {
      z: data_z,
      type: "heatmap",
      colorscale: colorscale,
      //   colorscale: colorscale,
      showscale: false,
    },
  ];

  const data_sorted = [
    {
      z: data_z_sorted,
      type: "heatmap",
      colorscale: colorscale,
      //   colorscale: colorscale,
      showscale: false,
    },
  ];

  let config = {
    // modeBarButtonsToRemove: ["AutoScale2d", "lasso2d", "select2d"],
    displayModeBar: false,
    // scrollZoom: true,
  };

  const layout_1 = {
    title: "Raw Data",
    // width: 280,
    // height: 700,
    dragmode: "false",
  };
  const layout_2 = {
    title: "Result of Classification",
    // width: 280,
    // height: 700,
    dragmode: "false",
  };
  const layout_3 = {
    title: "Title X",
    // width: 280,
    // height: 700,
    dragmode: "false",
  };

  var layout_pie = {
    // height: 500,
    // width: 500,
    margin: { t: 0, b: 0, l: 0, r: 0 },
    showlegend: false,
  };

  const handleClick = (event) => {
    // console.log("clicked");
    props.newRun();
  };

  const generatePdf = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Results_of_" + algo_name + ".pdf");
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
      {/* <div className="w-[80%] mx-auto text-center py-5 mb-8 mt-3 text-xl border shadow">
        {" "}
        Results of <span className="font-bold">{algo_name}</span>
      </div> */}
      <div className="text-center">
        <button
          type="button"
          onClick={generatePdf}
          class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          Download this report as PDF
          <FaFilePdf size={21} />
        </button>
      </div>
      <div ref={pdfRef} className="ALGO_report">
        <div className="h-10"></div>
        <div className="flex justify-center mb-10">
          {classNames.map((name, index) => (
            <div key={index} className="flex items-center mr-5">
              <div
                style={{
                  ...colorSquare_styles,
                  backgroundColor: colors[index],
                }}
              ></div>
              <div>{name}</div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Plot
            data={data_orig}
            //   config={config}
            layout={layout_1}
            config={config}
            //   onClick={handleClick}
          />
          <Plot
            data={data}
            //   config={config}
            layout={layout_2}
            config={config}
            //   onClick={handleClick}
          />
          <Plot
            data={data_sorted}
            //   config={config}
            layout={layout_3}
            config={config}
            //   onClick={handleClick}
          />
          <Plot
            data={data_pie}
            //   config={config}
            layout={layout_pie}
            // config={config}
            //   onClick={handleClick}
          />
        </div>

        {/* <div className="flex justify-center">
          
        </div> */}
      </div>
    </>
  );
};

const colorSquare_styles = {
  width: "20px",
  height: "20px",
  marginRight: "3px",
};
export default ClassificationHeatmap;
