import { useEffect, useState } from "react";
import Visual_2_heatmap from "./Visual_2_heatmap";
import axios from "axios";
import Visual_2_scatter from "./Visual_2_scatter";
import { FaBroomBall } from "react-icons/fa6";
function Visual_2(props) {
  // For heatmap
  const [data, setData] = useState([]);
  const [bands, setBands] = useState([]);
  const [bandsColorsPalt, setBandsColorsPalt] = useState(["Hot"]);
  const [markers, setMarkers] = useState([]);

  // For scatter
  const [traces, setTraces] = useState([]);

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
        // console.log("band" + band + " requested");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function fetchPointWavelenghts(pointX, pointY) {
    axios
      .get(props.host + "/pointWavelenghts/" + pointX + "/" + pointY)
      .then((response) => {
        var object_gs = {
          x: bands,
          y: response.data,
          type: "scatter",
          name: "(" + pointY + ", " + pointX + ")",
        };
        setTraces((oldValues) => [...oldValues, object_gs]);
        setMarkers([...markers, { x: pointX, y: pointY }]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function clearPoints() {
    setTraces([]);
    setMarkers([]);
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
                <Visual_2_heatmap
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
                  <Visual_2_scatter
                    traces={traces}
                    fetchPointWavelenghts={fetchPointWavelenghts}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Visual_2;
