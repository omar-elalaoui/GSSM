import axios from "axios";
import { useState } from "react";
import { DiAptana } from "react-icons/di";
import { FaCheck } from "react-icons/fa";

import { TfiReload } from "react-icons/tfi";

import Select from "react-select";
import ClassificationHeatmap from "./AlgoMap";
const Supervised = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [fileError, setFileError] = useState("");
  const [fileOK, setFileOK] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [thresholds, setThresholds] = useState([]);
  const [selectedThresholds, setSelectedThresholds] = useState([]);
  const [inputsFormValues, setInputsFormValues] = useState(null);
  const [dataRadioSelected, setDataRadioSelected] = useState("option1");
  const [filtrationIsChecked, setFiltrationIsChecked] = useState(false);
  const [selectedFilterList, setSelectedFilterList] = useState([]);
  const [optionsForSelectedFilter, setOptionsForSelectedFilter] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedFilterOption, setSelectedFilterOption] = useState(null);
  const [algos, setAlgos] = useState([
    { value: "SAM", label: "SAM" },
    { value: "ML", label: "Maximum Likelihood" },
    { value: "MD", label: "Minimum Distance" },
  ]);
  const [running, setRunning] = useState(-1);
  const [heatmapData, setHeatmapData] = useState(null);

  const handleSelectChange = (selectedOptions) => {
    setSelectedThresholds(selectedOptions);
  };

  const handleDataFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSelectedThresholds([]);
    setFileError("");
    setFileOK("");
    // setThresholds([]);
  };

  const load_csv = () => {
    if (selectedFile) {
      setFileLoading(true);
      const formData = new FormData();
      formData.append("csv_file", selectedFile);
      axios
        .post(props.host + "/loadCSV", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setFileLoading(false);
          if (response.data.status === "error") {
            setFileError(response.data.message);
          } else {
            setThresholds(
              response.data.csv_data.map((item) => ({
                value: item,
                label: item,
              }))
            );
            setFileOK("File loaded successfully");
          }
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleInputsChange = (event) => {
    const { name, value } = event.target;
    setInputsFormValues({ ...inputsFormValues, [name]: value });
  };

  function handleAlgoChange(event) {
    setSelectedAlgo(event.value);
    // console.log(event.value);
  }

  function handleFilterOptionChange(event) {
    setSelectedFilterOption(event.value);
  }

  const runAlgo = (event) => {
    event.preventDefault();
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
    setRunning(1);
    const formData = new FormData();
    formData.append("data_to_process", JSON.stringify(data_to_process));
    formData.append("csv_file", selectedFile);
    formData.append("algo", selectedAlgo);
    formData.append("inputs", JSON.stringify(inputsFormValues));
    axios
      .post(props.host + "/run_algo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // console.log(response.data);
        setRunning(0);
        setHeatmapData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
  const newRun = () => {
    setRunning(-1);
    setHeatmapData(null);
    setSelectedThresholds([]);
    setThresholds([]);
    setSelectedFile(null);
    setSelectedAlgo(null);
    setFileError("");
    setFileOK("");
    setFileLoading(false);
    setInputsFormValues(null);
    setDataRadioSelected("option1");
    setFiltrationIsChecked(false);
    setSelectedFilter(null);
    setSelectedFilterOption(null);
    setOptionsForSelectedFilter([]);
    setSelectedFilterList([]);
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
            <ClassificationHeatmap
              heatmapData={heatmapData}
              newRun={newRun}
              algo_name={selectedAlgo}
            />
          )}

          {running == -1 && (
            <>
              <form onSubmit={runAlgo}>
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
                  <div className="">
                    Upload spectral terget in .csv format:{" "}
                  </div>
                  {fileError && (
                    <div className="flex">
                      <div
                        class="px-3 mt-2 bg-red-500 text-sm text-white rounded-sm p-1"
                        role="alert"
                      >
                        <span class="font-bold">Error!</span> {fileError}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div class="relative inline-flex items-center w-full gap-2 my-3 text-md border rounded border-slate-200 text-slate-500 w-[50%]">
                      <input
                        id="file-upload"
                        class="peer order-2 [&::file-selector-button]:hidden"
                        required
                        name="csv_file"
                        type="file"
                        onChange={handleDataFileChange}
                      />
                      <label
                        for="file-upload"
                        class="inline-flex items-center justify-center h-8 gap-2 px-4 text-sm font-medium tracking-wide text-white transition duration-300 cursor-pointer whitespace-nowrap bg-orange-500 hover:bg-orange-600 focus:bg-orange-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-orange-300 disabled:bg-orange-300"
                      >
                        <span class="order-2">Select a file</span>
                        <span class="relative">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            aria-label="File input icon"
                            role="graphics-symbol"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-5 h-5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                            />
                          </svg>
                        </span>
                      </label>
                    </div>
                    <div className="upload_btn">
                      {!fileLoading ? (
                        <div
                          // type="button"
                          onClick={load_csv}
                          class="cursor-pointer mr-2 inline-flex items-center justify-center h-8 gap-2 px-4 text-semibold  tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-orange-500 hover:bg-orange-600 disabled:cursor-not-allowed disabled:border-orange-300 disabled:bg-orange-300 disabled:shadow-none"
                        >
                          <span>Load</span>
                          <TfiReload />
                        </div>
                      ) : (
                        <button
                          onClick={load_csv}
                          class="inline-flex items-center justify-center h-8 gap-2 px-4 text-semibold  tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-orange-500 hover:bg-orange-600  disabled:cursor-not-allowed disabled:border-orange-300 disabled:bg-orange-300 disabled:shadow-none"
                        >
                          <span>Load</span>
                          <span class="relative only:-mx-6">
                            <svg
                              class="w-4 h-4 text-white animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              role="graphics-symbol"
                              aria-labelledby="title-15 desc-15"
                            >
                              <title id="title-15">Icon title</title>
                              <desc id="desc-15"></desc>
                              <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                              ></circle>
                              <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  {fileOK && (
                    <div className="flex opacity-70">
                      <div
                        class="px-3 flex items-center justify-center bg-green-500 rounded-sm text-sm text-white p-1"
                        role="alert"
                      >
                        <FaCheck className="mr-2" /> {fileOK}
                      </div>
                    </div>
                  )}
                </div>

                <div className="py-5 px-5 border shadow-md mt-5">
                  <div className="w-[40%]">
                    Select Model
                    <Select
                      placeholder="Select"
                      required
                      options={algos}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={handleAlgoChange}
                      isDisabled={!selectedFile}
                    />
                  </div>
                  {/* Select multiple */}
                  <div className="w-[40%] mt-5">
                    Select Targets
                    <Select
                      placeholder="Select"
                      isMulti
                      required
                      options={thresholds}
                      value={selectedThresholds}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={handleSelectChange}
                      isDisabled={selectedAlgo == null}
                    />
                  </div>

                  {/* Selected inputs */}
                  {selectedThresholds.length !== 0 && (
                    <>
                      <div className="w-[40%] selected_inputs mt-5">
                        Fill the thresholds
                        {selectedThresholds.map((item, idx) => (
                          <div class="flex rounded-lg shadow-sm mb-2">
                            <span class="px-4 inline-flex items-center min-w-fit rounded-s-md border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500 dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
                              {item.label}
                            </span>
                            <input
                              name={item.value}
                              onChange={handleInputsChange}
                              required
                              type="number"
                              step="0.01"
                              class="border py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm rounded-e-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div class="mt-5">
                  {selectedThresholds.length !== 0 && (
                    <button
                      type="submit"
                      // onClick={runAlgo}
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
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Supervised;
