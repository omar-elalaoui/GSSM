import { useEffect, useState } from "react";
import Heatmap from "./Heatmap";
import axios from "axios";
import Scatter from "./Scatter";
import { FaBroomBall, FaFilePdf } from "react-icons/fa6";
import Line_annotations from "./Line_annotatios";
import { MdRestartAlt } from "react-icons/md";

import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
function Band_ratio(props) {
  const pdfRef = useRef();
  // For heatmap
  const [data, setData] = useState([]);
  const [bands, setBands] = useState([]);
  const [bandsColorsPalt, setBandsColorsPalt] = useState(["Hot"]);
  const [markers, setMarkers] = useState([]);

  const [threshold, setThreshold] = useState(null);
  const [returnData, setReturnData] = useState(null);

  // For scatter
  const [traces, setTraces] = useState([]);
  const [meanTraces, setMeanTraces] = useState([]);

  const [running, setRunning] = useState(-1);

  let colors = [
    "Hot",
    "Greys",
    "Viridis",
    "Greens",
    "YlOrRd",
    "YlGnBu",
    "RdBu",
    "Portland",
    "Picnic",
    "Jet",
  ];

  useEffect(() => {
    console.log("HIIII 1");
    if (props.DataMounted.isMounted) {
      console.log("HIIII 2");
      axios
        .get(props.host + "/getBands")
        .then((response) => {
          setBands(response.data);
          // console.log("bads requested");
        })
        .catch((error) => {
          console.log(error);
        });

      axios
        .get(props.host + "/band0")
        .then((response) => {
          setData(response.data);
          // console.log("band0 requested");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);
  function handleThresholdChange(event) {
    setThreshold(event.target.value);
  }
  function fetchBandData(band) {
    setData([]);
    axios
      .get(props.host + "/bandData/" + band)
      .then((response) => {
        setData(response.data);
        // console.log("band" + band + " requested");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function calculateMatrixMeans(matrix) {
    // Check if the matrix is empty
    if (matrix.length === 0) return [];

    // Initialize an array to store the sum of each column
    let columnSums = new Array(matrix[0].length).fill(0);

    // Iterate through each row
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        columnSums[j] += matrix[i][j];
      }
    }

    // Calculate the mean for each column
    let columnMeans = columnSums.map((sum) => sum / matrix.length);

    return columnMeans;
  }
  function fetchPointWavelenghts(pointX, pointY) {
    axios
      .get(props.host + "/pointWavelenghts/" + pointX + "/" + pointY)
      .then((response) => {
        let yValues = traces.map((trace) => trace.y);
        yValues = [...yValues, response.data];
        const yMean = calculateMatrixMeans(yValues);
        var object_yMean = {
          x: bands,
          y: yMean,
          name: "Mean",
          mode: "lines+markers",
          marker: {
            color: "Black",
            size: 4,
          },
          line: {
            color: "black",
            width: 4,
          },
        };
        var object_gs = {
          x: bands,
          y: response.data,
          name: "(" + pointY + ", " + pointX + ")",
        };
        const newTraces = [...traces, object_gs];
        setTraces(newTraces);
        setMeanTraces(object_yMean);
        setMarkers([...markers, { x: pointX, y: pointY }]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional for smooth scrolling
    });
    setRunning(1);
    const formData = new FormData();
    formData.append("threshold", threshold);
    formData.append("yMean", JSON.stringify(meanTraces["y"]));
    axios
      .post(props.host + "/band_ratio", formData)
      .then((response) => {
        setRunning(0);
        setReturnData(response.data);
        // console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function newRun() {
    setThreshold(null);
    setReturnData(null);
    setMeanTraces(null);
    clearPoints();
    setRunning(-1);
  }

  function clearPoints() {
    setTraces([]);
    setMarkers([]);
  }

  const generatePdf = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    // pdf.addPage();
    // pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Report_.pdf");
  };
  return (
    <>
      {props.DataMounted.isMounted == false ? (
        <div className="text-center mt-10 px-20">
          <div
            class="w-full px-4 py-3 text-sm border rounded text-slate-200 border-slate-900 bg-slate-700"
            role="alert"
          >
            <p>No data mounted!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex">
            <div
              class="mb-10 relative max-w-full gap-4 px-4 py-3 overflow-hidden text-sm rounded shadow-md bg-slate-100 text-slate-700 shadow-slate-500/20 ring-1 ring-inset ring-slate-200"
              role="status"
            >
              <p class="">
                Loaded Data:{""} &nbsp;
                <span class="font-bold">
                  {props.DataMounted.dataName_mouted}
                </span>
              </p>
            </div>
          </div>
          {running == 1 && (
            <div className="flex justify-center">
              <div>
                Running...
                {/* <div className="display-inline-block mx-auto"> */}
                <div class="ml-3 mt-2 spinner"></div>
                {/* </div> */}
              </div>
            </div>
          )}
          {running == 0 && returnData != null && (
            <div className="m-10">
              <div className="fex mb-3">
                <button
                  type="button"
                  onClick={newRun}
                  class=" mr-2 py-2 px-4 inline-flex items-center gap-x-2 text-sm font-semibold border border-transparent bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <MdRestartAlt size={21} />
                  New run
                </button>
                <button
                  onClick={generatePdf}
                  type="button"
                  class=" py-2 px-4 inline-flex items-center gap-x-2 text-sm font-semibold border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <FaFilePdf size={21} />
                  Download PDF
                </button>
              </div>
              <div className=" p-5 shadow-lg border" ref={pdfRef}>
                <div className="grid grid-cols-3 mt-5">
                  <div className="col-span-2">
                    <Line_annotations
                      meanTrace={[meanTraces.x, meanTraces.y]}
                      minMarkers={[
                        returnData.minima_wavelengths,
                        returnData.minima_indices,
                      ]}
                      maxMarkers={[
                        returnData.maxima_wavelengths,
                        returnData.maxima_indices,
                      ]}
                    />
                  </div>
                  <div className="m-10">
                    <div class="flex flex-col">
                      <div class="-m-1.5 overflow-x-auto">
                        <div class="p-1.5 min-w-full inline-block align-middle">
                          <div class="border rounded-lg overflow-hidden dark:border-neutral-700">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                              <thead>
                                <tr className="divide-x">
                                  <th
                                    scope="col"
                                    class=" bg-orange-500 px-6 py-3 text-sm font-medium text-gray-700 font-semibold text-center"
                                  >
                                    Min
                                  </th>
                                  <th
                                    scope="col"
                                    class="bg-blue-500 px-6 py-3 text-sm font-medium text-gray-700 font-semibold text-center"
                                  >
                                    Max
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="divide-y  divide-gray-200 dark:divide-neutral-700">
                                <tr className="divide-x">
                                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                                    {returnData.minima_wavelengths.map(
                                      (wavelength, index) => {
                                        return <p>{wavelength}</p>;
                                      }
                                    )}
                                  </td>
                                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                                    {returnData.maxima_wavelengths.map(
                                      (wavelength, index) => {
                                        return <p>{wavelength}</p>;
                                      }
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fex">
                  <h1 className="text-center mb-5 p-4 border">
                    Plots of Resulting Minimum Wavelengths
                  </h1>
                  {returnData.minima_data.map((minima, index) => {
                    return <Heatmap data={minima} color={colors[7]} />;
                  })}
                </div>
                <div className="fex">
                  <h1 className="text-center mb-5 p-4 border">
                    Plots of Resulting Maximum Wavelengths
                  </h1>
                  {returnData.maxima_data.map((maxima, index) => {
                    return <Heatmap data={maxima} color={colors[7]} />;
                  })}
                </div>
              </div>
            </div>
          )}
          {running == -1 && (
            <div className="container mx-auto mt-10">
              <div className="inline-flex gap-3">
                <div className="border rounded">
                  {bands.length == 0 ? (
                    <select>
                      <option value="">Loading...</option>
                    </select>
                  ) : (
                    <>
                      <select
                        // className="p-3"
                        onChange={(e) => {
                          fetchBandData(e.target.value);
                        }}
                      >
                        {bands.map((band, index) => {
                          return (
                            <option value={index}>
                              Band {index} ({band})
                            </option>
                          );
                        })}
                      </select>
                    </>
                  )}
                </div>
                <div className="border rounded">
                  <select
                    onChange={(e) => {
                      setBandsColorsPalt([e.target.value]);
                      // console.log(e.target.value);
                    }}
                  >
                    {colors.map((color, index) => {
                      return <option value={color}>{color}</option>;
                    })}
                  </select>
                </div>

                <div>
                  {markers.length >= 1 ? (
                    <button
                      onClick={clearPoints}
                      type="button"
                      class="py-2.5 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-red-900 dark:text-red-400"
                    >
                      Clear <FaBroomBall />
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="">
                  <Heatmap
                    data={data}
                    color={bandsColorsPalt[0]}
                    markers={markers}
                    fetchPointWavelenghts={fetchPointWavelenghts}
                    clearPoints={clearPoints}
                  />
                </div>
                <div className="">
                  {traces.length == 0 ? (
                    ""
                  ) : (
                    <>
                      <Scatter
                        traces={traces}
                        meanTraces={meanTraces}
                        fetchPointWavelenghts={fetchPointWavelenghts}
                      />
                      <div className="ml-10">
                        <div class="max-w-sm">
                          <label
                            for="input-label"
                            class="block text-sm font-medium mb-2 dark:text-white"
                          >
                            Threshold
                          </label>
                          <div>
                            <form
                              onSubmit={handleSubmit}
                              className="flex items-center"
                            >
                              <div className="mr-2">
                                <input
                                  type="number"
                                  required
                                  onChange={handleThresholdChange}
                                  id="input-label"
                                  class="py-3 px-3 block w-full border rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                />
                              </div>

                              <div className="submit_br">
                                <button
                                  type="submit"
                                  class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                  Submit
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Band_ratio;
