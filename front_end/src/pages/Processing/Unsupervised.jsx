import { useState } from "react";
import Select from "react-select";
import { DiAptana } from "react-icons/di";
import axios from "axios";
import ClassificationHeatmapUpsup from "./AlgoMap_unsup";
const Unsupervised = (props) => {
  const [algos, setAlgos] = useState([{ value: "KM", label: "K-MEANS" }]);
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [inputsFormValues, setInputsFormValues] = useState(null);
  const [running, setRunning] = useState(-1);
  const [heatmapData, setHeatmapData] = useState(null);

  const [dataRadioSelected, setDataRadioSelected] = useState("option1");
  const [filtrationIsChecked, setFiltrationIsChecked] = useState(false);
  const [selectedFilterList, setSelectedFilterList] = useState([]);
  const [optionsForSelectedFilter, setOptionsForSelectedFilter] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedFilterOption, setSelectedFilterOption] = useState(null);

  function handleAlgoChange(event) {
    setSelectedAlgo(event.value);
    // console.log(event.value);
  }
  const handleInputsChange = (event) => {
    const { name, value } = event.target;
    setInputsFormValues({ ...inputsFormValues, [name]: value });
  };

  function handleFilterOptionChange(event) {
    setSelectedFilterOption(event.value);
  }
  function handleRadioChange(event) {
    setDataRadioSelected(event.target.value);
    setFiltrationIsChecked(false);
    setSelectedFilter(null);
    setSelectedFilterOption(null);
  }

  function handleFiltrCheckboxChange(event) {
    setFiltrationIsChecked(event.target.checked);
  }
  function handleFilterChange(event) {
    // console.log(event.value);
    setOptionsForSelectedFilter([]);
    setSelectedFilter(event.value);
    axios
      .get(props.host + "/list_filters/" + event.value)
      .then((response) => {
        setSelectedFilterList(response.data);
        if (response.data[0] == "gs") {
          for (let i = 0; i < response.data[1].length; i++) {
            setOptionsForSelectedFilter((prev) => [
              ...prev,
              {
                value: response.data[1][i].id,
                label: "GS_F" + response.data[1][i].id,
              },
            ]);
          }
        } else if (response.data[0] == "sv") {
          for (let i = 0; i < response.data[1].length; i++) {
            setOptionsForSelectedFilter((prev) => [
              ...prev,
              {
                value: response.data[1][i].id,
                label: "SV_F" + response.data[1][i].id,
              },
            ]);
          }
        }
        console.log(response.data);
        // console.log(optionsForSelectedFilter);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const runAlgo = () => {
    setRunning(1);
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional for smooth scrolling
    });
    let data_to_process = { data_type: "original" };
    if (dataRadioSelected === "option2") {
      data_to_process = {
        data_type: "preprocessed",
        filter: selectedFilter,
        filterID: selectedFilterOption,
      };
    }
    const formData = new FormData();
    formData.append("data_to_process", JSON.stringify(data_to_process));
    formData.append("algo", selectedAlgo);
    formData.append("inputs", JSON.stringify(inputsFormValues));
    axios
      .post(props.host + "/run_algo_usupervised", formData)
      .then((response) => {
        // console.log(new Set(response.data["data_z"].flat()));
        setRunning(0);
        setHeatmapData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const newRun = () => {
    setRunning(-1);
    setHeatmapData(null);
    setSelectedAlgo(null);
    setInputsFormValues(null);
  };
  return (
    <div className="ml-5 mt-5 text-gray-500">
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
          {}
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
          {running == 0 && (
            <ClassificationHeatmapUpsup
              heatmapData={heatmapData}
              newRun={newRun}
              algo_name={selectedAlgo}
            />
          )}
          {running == -1 && (
            <>
              <div class="w-[50%] grid sm:grid-cols-2 gap-2 mb-3">
                <label
                  for="hs-radio-in-form"
                  class="flex p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                >
                  <input
                    type="radio"
                    checked={dataRadioSelected === "option1"}
                    onChange={handleRadioChange}
                    value={"option1"}
                    name="hs-radio-in-form"
                    class="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                    id="hs-radio-in-form"
                  />
                  <span class="text-sm text-gray-500 ms-3 dark:text-neutral-400">
                    &nbsp;Original Data
                  </span>
                </label>

                <label
                  for="hs-radio-checked-in-form"
                  class="flex p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                >
                  <input
                    type="radio"
                    checked={dataRadioSelected === "option2"}
                    onChange={handleRadioChange}
                    value={"option2"}
                    name="hs-radio-in-form"
                    class="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                    id="hs-radio-checked-in-form"
                  />
                  <span class="text-sm text-gray-500 ms-3 dark:text-neutral-400">
                    &nbsp;Pre-processed Data
                  </span>
                </label>
              </div>

              <div class="mb-10 flex items-center">
                {dataRadioSelected == "option2" && (
                  <>
                    <label
                      for="hs-checkbox-in-form"
                      class="mr-2 p-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      <input
                        type="checkbox"
                        required
                        checked={filtrationIsChecked}
                        onChange={handleFiltrCheckboxChange}
                        class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                        id="hs-checkbox-in-form"
                      />
                      <span class="text-sm text-gray-500 ms-3 dark:text-neutral-400">
                        &nbsp;Filtration
                      </span>
                    </label>
                    {filtrationIsChecked && (
                      <>
                        <Select
                          placeholder="Filter Type"
                          className="w-[200px] basic-multi-select"
                          required
                          options={[
                            { value: "gs", label: "Gaussian" },
                            { value: "sv", label: "Savgol" },
                            { value: "md", label: "Median" },
                          ]}
                          classNamePrefix="select"
                          onChange={handleFilterChange}
                          // isDisabled={!selectedFile}
                        />{" "}
                        &ensp;
                        {selectedFilterList.length > 0 && (
                          <div className="">
                            <Select
                              required
                              placeholder="Filter Type"
                              className="w-[200px] basic-multi-select"
                              options={optionsForSelectedFilter}
                              classNamePrefix="select"
                              onChange={handleFilterOptionChange}
                              // isDisabled={!selectedFile}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="py-10 px-5 border shadow-md ">
                <div className="w-[40%]">
                  Select Model
                  <Select
                    placeholder="Select"
                    options={algos}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handleAlgoChange}
                    // isDisabled={!selectedFile}
                  />
                  <div class="mt-4 flex rounded-lg shadow-sm mb-2">
                    <span class="px-4 inline-flex items-center min-w-fit rounded-s-md border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500 dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
                      Number of clusters
                    </span>
                    <input
                      name="n_clusters"
                      onChange={handleInputsChange}
                      type="number"
                      class="border py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm rounded-e-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-5">
                {selectedAlgo && (
                  <button
                    onClick={runAlgo}
                    class="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded shadow-md focus-visible:outline-none whitespace-nowrap bg-orange-500 shadow-orange-200 hover:bg-orange-600 hover:shadow-sm hover:shadow-orange-200 focus:bg-orange-700 focus:shadow-sm focus:shadow-orange-200 disabled:cursor-not-allowed disabled:border-orange-300 disabled:bg-orange-300 disabled:shadow-none"
                  >
                    <span class="flex items-center ">
                      {" "}
                      <DiAptana className="mr-2" />
                      <span className="text-md font-bold">Run</span>
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}{" "}
    </div>
  );
};

export default Unsupervised;
