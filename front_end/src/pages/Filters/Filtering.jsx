import { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineDoneAll } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import Select from "react-select";
import { FaPlus } from "react-icons/fa";
import { DiAptana } from "react-icons/di";
import Filter_Visualization from "./Filter_Visualization";
import Modal_delete from "./Modal_delete";

function Filtering(props) {
  useEffect(() => {
    get_filters_list({ value: "gs" });
  }, []);
  const [filteringStatus, setFilteringStatus] = useState(0);
  const [selectedNewFilter, setSelectedNewFilter] = useState(null);
  const [inputsNewFilter, setInputsNewFilter] = useState(null);
  const [filterIsRunning, setFilterIsRunning] = useState(false);
  const [filtersList, setFiltersList] = useState([]);
  const filters_options = [
    { value: "gs", label: "Gaussian Filter" },
    { value: "sv", label: "Savgol Filter" },
    // { value: "3", label: "Median Filter" },
  ];
  function handleFiltering(event) {
    console.log(event);
  }

  function handleNewFilterSelection(event) {
    // setInputsNewFilter({ ...inputsNewFilter, selected_filter: event.value });
    setSelectedNewFilter(event.value);
  }

  function handleInputsChange(event) {
    const { name, value } = event.target;
    setInputsNewFilter({ ...inputsNewFilter, [name]: value });
  }
  function runFilter(event) {
    event.preventDefault();

    if (selectedNewFilter) {
      const json_data = {
        ...inputsNewFilter,
        selected_filter: selectedNewFilter,
      };

      // console.log(json_data);
      const selectedFilterTemp = selectedNewFilter;
      axios
        .post(props.host + "/run_filter", json_data)
        .then((response) => {
          console.log(response.data);
          get_filters_list({ value: selectedFilterTemp });
          setFilterIsRunning(false);
        })
        .catch((error) => {
          console.log(error);
        });

      setFilteringStatus(0);
      setSelectedNewFilter(null);
      setInputsNewFilter(null);
      setFilterIsRunning(true);
    }
  }

  function get_filters_list(event) {
    axios
      .get(props.host + "/list_filters/" + event.value)
      .then((response) => {
        setFiltersList(response.data);
        // console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    // setFilteringStatus(0);
    // setSelectedNewFilter(null);
    // setInputsNewFilter(null);
  }

  function mount_filter(id, filter_type) {
    setFilteringStatus(2);
    axios
      .get(props.host + "/mout_filter/" + id + "/" + filter_type)
      .then((response) => {
        // setFiltersList(response.data);
        console.log(response.data);
        setFilteringStatus(3);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handle_delete(folder_id, filter_id, filter_type) {
    axios
      .get(
        props.host +
          "/delete_filter/" +
          folder_id +
          "/" +
          filter_id +
          "/" +
          filter_type
      )
      .then((response) => {
        const newData = [...filtersList[1]];
        const filteredData = newData.filter((obj) => obj.id != filter_id);
        console.log(filtersList);
        console.log([filtersList[0], filteredData]);
        setFiltersList([filtersList[0], filteredData]);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <>
      {/* <div class="flex items-center self-center text-orange-500">
        <div class=" clv-spinner"></div>
      </div> */}
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
              class="mb-20 relative max-w-full gap-4 px-4 py-3 overflow-hidden text-sm rounded shadow-md bg-slate-100 text-slate-700 shadow-slate-500/20 ring-1 ring-inset ring-slate-200"
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

          {filteringStatus == 0 && (
            <>
              <div className="flex justify-between mx-5">
                <div className="w-[250px]">
                  <Select
                    placeholder="Filters"
                    options={filters_options}
                    defaultValue={filters_options[0]}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={get_filters_list}
                    // onChange={handleAlgoChange}
                    // isDisabled={!selectedFile}
                  />
                </div>
                <div>
                  {!filterIsRunning && (
                    <button
                      onClick={() => setFilteringStatus(1)}
                      type="button"
                      class="mb-2 py-2 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-sm border border-transparent bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      New Filtering
                      <FaPlus size={19} />
                    </button>
                  )}

                  {filterIsRunning && (
                    <button
                      type="button"
                      class="py-2 px-4 inline-flex items-center gap-x-2 text-sm  border border-gray-500 text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-400 dark:text-neutral-400 dark:hover:text-neutral-300 "
                    >
                      <div class="flex items-center self-center text-orange-500">
                        <div class=" clv-spinner"></div>
                      </div>
                      <b>Running</b>
                    </button>
                  )}
                </div>
              </div>

              {filtersList.length > 0 && (
                <div className="mx-5 mt-3">
                  <ul class="flex flex-col w-full">
                    {filtersList[0] == "gs" && (
                      <>
                        {filtersList[1].map((filter) => (
                          <li class="inline-flex justify-between items-center gap-x-2 py-3 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
                            <div>
                              <b>GS_F{filter.id}</b> [sigma= {filter.sigma}]
                            </div>
                            <div>
                              <button
                                onClick={() => mount_filter(filter.id, "gs")}
                                class="mr-2 inline-flex items-center justify-center h-6 gap-2 px-4 text-xs font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
                              >
                                <span>explore</span>
                              </button>
                              <Modal_delete
                                folder_ID={props.DataMounted.dataID_mouted}
                                filter_ID={filter.id}
                                filter_type={"gs"}
                                handle_delete={handle_delete}
                              />
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                    {filtersList[0] == "sv" && (
                      <>
                        {filtersList[1].map((filter) => (
                          <li class="inline-flex justify-between items-center gap-x-2 py-3 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-white">
                            <div>
                              <b>SV_F{filter.id}</b> [window_length={" "}
                              {filter.window_length}, polyorder={" "}
                              {filter.polyorder} ]
                            </div>

                            <div>
                              <button
                                onClick={() => mount_filter(filter.id, "gs")}
                                class="mr-2 inline-flex items-center justify-center h-6 gap-2 px-4 text-xs font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
                              >
                                <span>explore</span>
                              </button>
                              <Modal_delete
                                folder_ID={props.DataMounted.dataID_mouted}
                                filter_ID={filter.id}
                                filter_type={"sv"}
                                handle_delete={handle_delete}
                              />
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
          {filteringStatus == 1 && (
            <>
              <div className="new_filtering border shadow-md mt-5 pt-10 pb-5 w-[60%] mx-auto">
                <form onSubmit={runFilter} className="w-[250px] mx-auto">
                  <Select
                    placeholder="Select Filter"
                    options={filters_options}
                    // defaultValue={filters_options[0]}
                    className="basic-select mb-5"
                    classNamePrefix="select"
                    onChange={handleNewFilterSelection}
                    // isDisabled={!selectedFile}
                  />
                  {selectedNewFilter == "gs" && (
                    <div className="">
                      <div class="flex rounded-lg shadow-sm">
                        <span class="px-4 inline-flex items-center min-w-fit rounded-s-md border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500 dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
                          Sigma
                          <span className="text-red-500 font-bold">
                            &ensp;*
                          </span>
                        </span>
                        <input
                          type="number"
                          name="sigma"
                          required
                          onChange={handleInputsChange}
                          class="border py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm rounded-e-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        />
                      </div>
                    </div>
                  )}

                  {selectedNewFilter == "sv" && (
                    <div className="">
                      <div class="flex rounded-lg shadow-sm mb-2">
                        <span class="px-4 inline-flex items-center min-w-fit rounded-s-md border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500 dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
                          Window_length
                          <span className="text-red-500 font-bold">
                            &ensp;*
                          </span>
                        </span>
                        <input
                          type="number"
                          name="window_length"
                          required
                          min={1}
                          step={2}
                          onChange={handleInputsChange}
                          class="border py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm rounded-e-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        />
                      </div>
                      <div class="flex rounded-lg shadow-sm">
                        <span class="px-4 inline-flex items-center min-w-fit rounded-s-md border border-e-0 border-gray-200 bg-gray-50 text-sm text-gray-500 dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
                          Polyorder
                          <span className="text-red-500 font-bold">
                            &ensp;*
                          </span>
                        </span>
                        <input
                          type="number"
                          name="polyorder"
                          min={0}
                          step={1}
                          max={
                            inputsNewFilter
                              ? inputsNewFilter["window_length"] - 1
                              : 0
                          }
                          required
                          onChange={handleInputsChange}
                          class="border py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm rounded-e-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-7 ">
                    <button
                      type="submit"
                      class=" inline-flex items-center justify-center h-9 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-orange-500 shadow-orange-200 hover:bg-orange-600 hover:shadow-sm hover:shadow-orange-200 focus:bg-orange-700 focus:shadow-sm focus:shadow-orange-200 disabled:cursor-not-allowed disabled:border-orange-300 disabled:bg-orange-300 disabled:shadow-none"
                    >
                      <span class="flex items-center ">
                        {" "}
                        <DiAptana className="mr-2" size={17} />
                        <span className="text-md font-bold">Run</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilteringStatus(0);
                        setSelectedNewFilter(null);
                        setInputsNewFilter(null);
                      }}
                      class=" inline-flex items-center justify-center h-9 gap-2 px-5 text-sm font-medium tracking-wide text-black transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-white border border shadow-orange-200 hover:bg-gray-100 focus:bg-orange-700 focus:shadow-sm focus:shadow-orange-200 disabled:cursor-not-allowed disabled:border-orange-300 disabled:bg-orange-300 disabled:shadow-none"
                    >
                      <span class="flex items-center ">
                        {/* <DiAptana className="mr-2" /> */}
                        <span className="text-md font-bold">Cancel</span>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
          {filteringStatus == 2 && (
            <div className="text-center mt-10 px-20">Loading the filter...</div>
          )}

          {filteringStatus == 3 && (
            <Filter_Visualization
              host={props.host}
              DataMounted={props.DataMounted}
            />
          )}
        </>
      )}
    </>
  );
}

export default Filtering;
