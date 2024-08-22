import { useCallback, useEffect, useState } from "react";
import Visual_3_heatmap from "./Visual_3_heatmap";
import axios from "axios";
import Visual_3_scatter from "./Visual_3_scatter";
import Visual_3_graph2 from "./Visual_3_graph2";
function Visual_3(props) {
  // For heatmap
  const [data, setData] = useState([]);
  const [bands, setBands] = useState([]);
  const [selectedBand, setSelectedBand] = useState(0);
  const [bandsColorsPalt, setBandsColorsPalt] = useState(["Hot"]);
  const [pixelDataselected, setPixelDataselected] = useState();
  const [dataForGraph2, setDataForGraph2] = useState();
  const [process, setProcess] = useState({
    getting: false,
    got: false,
    graph1: false,
    graph2: false,
  });
  // console.log(bands);

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
    if (props.DataMounted.isMounted) {
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

  function fetchBandData(band) {
    setData([]);
    axios
      .get(props.host + "/bandData/" + band)
      .then((response) => {
        setData(response.data);
        setSelectedBand(band);
        // console.log("band" + band + " requested");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const fetchSelectedWavelenghts = useCallback(fetchSelectedWavelenghts_1, []);
  function fetchSelectedWavelenghts_1(Datapoints, selectionType) {
    setProcess({
      getting: true,
      got: false,
      graph1: false,
      graph2: false,
    });
    var objJson = {
      ...Datapoints,
      band: selectedBand,
    };
    if (selectionType === "rect") {
      axios
        .post(props.host + "/rectLassoSelection", objJson)
        .then((response) => {
          var pixelData = {
            // bands: bands,
            wavesData: response.data.wavesData,
            wavesMean: response.data.wavesMean,
          };
          // console.log(pixelData);
          setPixelDataselected(pixelData);
          setDataForGraph2(response.data.selectedData);
          setProcess({
            getting: false,
            got: true,
            graph1: false,
            graph2: false,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (selectionType === "lasso") {
      axios
        .post(props.host + "/lassoSelection", objJson)
        .then((response) => {
          var pixelData = {
            wavesData: response.data.wavesData,
            wavesMean: response.data.wavesMean,
          };
          // console.log(pixelData);
          setPixelDataselected(pixelData);
          setProcess({
            getting: false,
            got: true,
            graph1: false,
            graph2: false,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  function display_graph1() {
    setProcess((prevState) => ({
      ...prevState,
      graph1: true,
    }));
  }
  function display_graph2() {
    setProcess((prevState) => ({
      ...prevState,
      graph2: true,
    }));
  }

  function boxes(status) {
    if (status == "getting") {
      return (
        <div className="text-center">
          <p>Retrieving wavelengths of the selected area</p>
          <div className="loader mt-5">
            <span className="loader_gs"></span>
          </div>
        </div>
      );
    } else if (status == "all") {
      return (
        <>
          {boxes("graph1")}
          {boxes("graph2")}
        </>
      );
    } else if (status == "graph1") {
      return (
        <div className="mt-10 text-center" onClick={display_graph1}>
          <a className="px-10 py-3 bg-green-500 font-bold text-gray-50 cursor-pointer">
            Graph 1
          </a>
        </div>
      );
    } else if (status == "graph2") {
      return (
        <div className="mt-10 text-center" onClick={display_graph2}>
          <a className="px-10 py-3 bg-green-500 font-bold text-gray-50 cursor-pointer">
            Graph 2
          </a>
        </div>
      );
    }
  }

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
          <div className="container mx-auto mt-10">
            <div className="inline-flex gap-3">
              <div className="border rounded">
                {bands.length == 0 ? (
                  <select>
                    <option value="">Loading...</option>
                  </select>
                ) : (
                  <select
                    // className="p-3"
                    onChange={(e) => {
                      fetchBandData(e.target.value);
                      console.log(e.target.value);
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
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="">
                <Visual_3_heatmap
                  data={data}
                  color={bandsColorsPalt[0]}
                  fetchSelectedWavelenghts={fetchSelectedWavelenghts}
                  // clearPoints={clearPoints}
                />
              </div>
              <div className="">
                {!process.graph1 ? (
                  ""
                ) : (
                  <Visual_3_scatter
                    pixelDataselected={pixelDataselected}
                    bands={bands}
                  />
                )}

                {!process.graph2 ? (
                  ""
                ) : (
                  <Visual_3_graph2 dataForGraph2={dataForGraph2} />
                )}

                {(() => {
                  if (process.getting) {
                    return boxes("getting");
                  } else if (process.got) {
                    if (!process.graph1 && !process.graph2) {
                      return boxes("all");
                    }
                    if (process.graph1 && !process.graph2) {
                      return boxes("graph2");
                    } else if (!process.graph1 && process.graph2) {
                      return boxes("graph1");
                    }
                  }
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Visual_3;
