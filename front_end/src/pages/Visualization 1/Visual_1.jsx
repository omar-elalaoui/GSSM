import { useEffect, useState } from "react";
import axios from "axios";
import Visual_1_heatmap from "./Visual_1_heatmap";
import Visual_1_scatter from "./Visual_1_scatter";
import { FaBroomBall } from "react-icons/fa6";
function Visual_1(props) {
  // For heatmap
  const [data, setData] = useState([]);
  const [bands, setBands] = useState([]);
  const [bandsColorsPalt, setBandsColorsPalt] = useState(["Hot"]);

  // For scatter
  const [wavesSelected, setWavesSelected] = useState([]);

  let colors = [
    "Hot",
    "Viridis",
    "Greys",
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
    // console.log(pointX + " " + pointY);
    // setWavesSelected([]);
    axios
      .get(props.host + "/pointWavelenghts/" + pointX + "/" + pointY)
      .then((response) => {
        setWavesSelected(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function clearPoints() {
    setWavesSelected([]);
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
                {wavesSelected.length >= 1 ? (
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

            <div className="grid grid-cols-2 mt-3 ">
              <div className="">
                <Visual_1_heatmap
                  data={data}
                  color={bandsColorsPalt[0]}
                  fetchPointWavelenghts={fetchPointWavelenghts}
                />
              </div>
              <div className="">
                {wavesSelected.length == 0 ? (
                  ""
                ) : (
                  <Visual_1_scatter
                    waves={bands}
                    wavesValues={wavesSelected}
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

export default Visual_1;
