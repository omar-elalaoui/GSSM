// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Visual_1 from "./pages/Visualization 1/Visual_1";
import Visual_2 from "./pages/Visualization 2/Visual_2";
import Visual_3 from "./pages/Visualization 3/Visual_3";
import Visual_4 from "./pages/Visualization 4/Visual_4";
// import Processing from "./pages/Processing";
// import Filter_1_gaussian from "./pages/Filters/Filter_1_gaussian";
// import Filter_2_savgol from "./pages/Filters/Filter_2_savgol";
import Spectral_data from "./pages/Spectral Data/Spectral_data";
import Data_upload from "./pages/Spectral Data/Data_upload";
import Unsupervised from "./pages/Processing/Unsupervised";
import Supervised from "./pages/Processing/Supervised";
import { useEffect, useState } from "react";
import axios from "axios";
import Filtering from "./pages/Filters/Filtering";
import Band_ratio from "./pages/Band Ratio/Band_ratio";
const host = "https://gsmi-backend.cleverlytics.site";
const App = () => {
  const [DataMounted, setDataMounted] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(-1);
  useEffect(() => {
    axios
      .get(host + "/test")
      .then((response) => {
        if (response.data == "cleverlytics") {
          setIsServerAvailable(1);
          axios
            .get(host + "/isMounted")
            .then((response) => {
              setDataMounted(response.data);
              console.log(response.data);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setIsServerAvailable(0);
      });
  }, []);
  return (
    <>
      <div>
        {isServerAvailable == 0 && (
          <div className="text-center h-screen flex justify-center items-center">
            <div
              class="w-[80%] px-4 py-3 text-sm border rounded text-slate-200 border-slate-900 bg-slate-700"
              role="alert"
            >
              <p>Server not available!</p>
            </div>
          </div>
        )}
        {isServerAvailable == 1 && (
          <div>
            <BrowserRouter>
              <RootLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route
                    path="/data"
                    element={
                      <Spectral_data host={host} DataMounted={DataMounted} />
                    }
                  />
                  <Route
                    path="/data/upload"
                    element={<Data_upload host={host} />}
                  />
                  {/* <Route path="/Preprocessing/" element={<Preprocessing />} /> */}
                  <Route
                    path="/Visualization/Single-Pixel Signature"
                    element={<Visual_1 host={host} DataMounted={DataMounted} />}
                  />
                  <Route
                    path="/Visualization/Multi-Pixels Signature"
                    element={<Visual_2 host={host} DataMounted={DataMounted} />}
                  />
                  <Route
                    path="/Visualization/Region-based Signature"
                    element={<Visual_3 host={host} DataMounted={DataMounted} />}
                  />
                  <Route
                    path="/Visualization/Line-based Signature"
                    element={<Visual_4 host={host} DataMounted={DataMounted} />}
                  />
                  <Route
                    path="/Preprocessing/Filtering"
                    element={
                      <Filtering host={host} DataMounted={DataMounted} />
                    }
                  />

                  <Route
                    path="/Processing/Supervised"
                    element={
                      <Supervised host={host} DataMounted={DataMounted} />
                    }
                  />
                  <Route
                    path="/Processing/Unsupervised"
                    element={
                      <Unsupervised host={host} DataMounted={DataMounted} />
                    }
                  />
                  <Route
                    path="/Processing/Band Ratio"
                    element={
                      <Band_ratio host={host} DataMounted={DataMounted} />
                    }
                  />
                </Routes>
              </RootLayout>
            </BrowserRouter>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
