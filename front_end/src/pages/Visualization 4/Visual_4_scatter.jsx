import Plot from "react-plotly.js";
import { useState, useEffect } from "react";

function Visual_4_scatter(props) {
  // let traces = [];
  const [traces, setTraces] = useState([]);

  useEffect(() => {
    if (props.pixelDataselected) {
      let traces_ = [];
      props.pixelDataselected.wavesData.forEach((element) => {
        var objj = {
          x: props.bands,
          y: element,
          type: "lines",
          line: {
            color: "rgb(46, 204, 113)",
            width: 0.5,
          },
        };
        traces_.push(objj);
        // console.log(objj);
      });
      setTraces(traces_);

      var traceMean = {
        x: props.bands,
        y: props.pixelDataselected.wavesMean,
        type: "lines",
        line: {
          color: "rgb(142, 68, 173)",
          width: 2,
        },
      };
      setTraces((oldValues) => [...oldValues, traceMean]);
    }
  }, []);

  // console.log(traces);

  let layaout = {
    width: 630,
    height: 400,
    showlegend: false,
    title: "Spectral Signatures in MWIR range",
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
    <>
      {traces.length != 0 ? (
        <div>
          <Plot data={traces} layout={layaout} config={config} />
        </div>
      ) : (
        <div className="text-center">
          <p>Printing Wavelengths...</p>
          {/* <p>{props.pixelDataselected.wavesData.length}</p> */}
          <div className="loader mt-5">
            <span className="loader_gs"></span>
          </div>
        </div>
      )}
    </>
  );
}

export default Visual_4_scatter;
