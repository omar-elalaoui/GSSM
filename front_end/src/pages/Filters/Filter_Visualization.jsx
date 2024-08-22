import { useEffect, useState } from "react";
import axios from "axios";
import Heatmap from "./Heatmap";
import Scatter from "./Scatter";
function Filter_Visualization(props) {
  // For heatmap
  const [data, setData] = useState([]);
  const [bands, setBands] = useState([]);
  const [bandsColorsPalt, setBandsColorsPalt] = useState(["Portland"]);

  // For scatter
  const [wavesSelected, setWavesSelected] = useState([]);

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

  function fetchPointWavelenghts(pointX, pointY) {
    // console.log(pointX + " " + pointY);
    // setWavesSelected([]);
    axios
      .get(props.host + "/pointWavelenghts_filter/" + pointX + "/" + pointY)
      .then((response) => {
        setWavesSelected(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="grid grid-cols-2">
          <div className="">
            {/* Hellooooo */}
            <Heatmap
              data={data}
              color={bandsColorsPalt[0]}
              fetchPointWavelenghts={fetchPointWavelenghts}
            />
          </div>
          <div className="">
            {wavesSelected.length == 0 ? (
              ""
            ) : (
              <>
                <Scatter
                  title={"Original"}
                  waves={bands}
                  wavesValues={wavesSelected.waveData}
                />
                <Scatter
                  title={"Filtred"}
                  waves={bands}
                  wavesValues={wavesSelected.waveData_filter}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Filter_Visualization;
