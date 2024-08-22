import { useCallback, useEffect, useState } from "react";
import Visual_4_heatmap from "./Visual_4_heatmap";
import axios from "axios";
import Visual_4_scatter from "./Visual_4_scatter";
import Visual_4_graph2 from "./Visual_4_graph2";
function Visual_3(props) {
  // For heatmap
  const [data, setData] = useState([]);
  const [bands, setBands] = useState([]);
  const [selectedBand, setSelectedBand] = useState(0);
  const [bandsColorsPalt, setBandsColorsPalt] = useState(["Hot"]);
  const [pixelDataselected, setPixelDataselected] = useState();
  const [pixelsWaveXvalues, setPixelsWaveXvalues] = useState();
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
    setPixelDataselected(null);
    setPixelsWaveXvalues(null);
    console.log(selectedBand);
    axios
      .get(props.host + "/bandData/" + band)
      .then((response) => {
        setData(response.data);
        setSelectedBand(band);
        // console.log("band " + band + " requested");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function fetchLineWavelenghts(Datapoints) {
    setPixelDataselected(null);
    var objJson = {
      ...Datapoints,
      band: selectedBand,
    };
    // console.log(objJson);
    axios
      .post(props.host + "/lineSelection", objJson)
      .then((response) => {
        var pixelData = {
          bands: bands,
          wavesData: response.data.wavesData,
          wavesMean: response.data.wavesMean,
        };
        setPixelDataselected(pixelData);
        setPixelsWaveXvalues(response.data.wavesXvalues);
        // console.log(response.data.wavesXvalues.length);
      })
      .catch((error) => {
        console.log(error);
      });
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

            <div className="grid grid-cols-2">
              <div className="">
                <Visual_4_heatmap
                  data={data}
                  color={bandsColorsPalt[0]}
                  fetchLineWavelenghts={fetchLineWavelenghts}
                  // clearPoints={clearPoints}
                />
              </div>
              <div className="">
                {!pixelDataselected ? (
                  ""
                ) : (
                  <>
                    <Visual_4_scatter
                      pixelDataselected={pixelDataselected}
                      bands={bands}
                    />

                    <Visual_4_graph2 pixelsWaveXvalues={pixelsWaveXvalues} />
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Visual_3;
