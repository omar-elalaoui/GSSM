import axios from "axios";
import { useEffect, useState } from "react";
import Modal_delete from "./Modal_delete";
import React from "react";
import { useLocation } from "react-router-dom";

export default function Accordion_PD(props) {
  const [dataList, setdataList] = useState([]);
  const [isMounting, setIsMounting] = useState(false);
  const [isListing, setIsListing] = useState(true);
  // const [mounted, setMounted] = useState(-1);
  const { state } = useLocation();
  useEffect(() => {
    axios
      .get(props.host + "/list_data")
      .then((response) => {
        setdataList(response.data);
        setIsListing(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [state]);

  async function mounData(event) {
    event.preventDefault();
    setIsMounting(true);
    // console.log(event.target["data_id"].value);
    let data_id = event.target["data_id"].value;
    const formData = new FormData();
    formData.append("data_id", data_id);
    axios
      .post(props.host + "/mount_data", formData)
      .then((response) => {
        // setMounted(data_id);
        // console.log("dooone");
        //  c
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
      });
  }
  function handle_delete(folder_id) {
    axios
      .get(props.host + "/delete_data_folder/" + folder_id)
      .then((response) => {
        const newData = [...dataList];
        const filteredData = newData.filter((obj) => obj.ID != folder_id);
        setdataList(filteredData);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return (
    <>
      <section className="mt-2 border w-full divide-y divide-slate-200 rounded bg-white shadow-md shadow-slate-200">
        {dataList.map((patient) => (
          <div
          // className={
          //   patient.ID == props.DataMounted.dataID_mouted ? "bg-blue-700" : ""
          // }
          >
            <details class="ml-4 group p-3">
              <summary className="relative cursor-pointer list-none pr-8 font-medium text-slate-700 transition-colors duration-300 focus-visible:outline-none group-hover:text-slate-900  [&::-webkit-details-marker]:hidden">
                <div className="flex justify-between">
                  <p>{patient.data_name}</p>
                  {patient.ID == props.DataMounted.dataID_mouted && (
                    <p>
                      <button class="inline-flex items-center justify-center h-6 gap-2 px-4 text-xs font-medium tracking-wide text-black transition duration-300 rounded-full focus-visible:outline-none whitespace-nowrap bg-[#ff771c] disabled:cursor-not-allowed">
                        <span>Loaded</span>
                      </button>
                    </p>
                  )}
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-0 top-1 h-4 w-4 shrink-0 stroke-slate-700 transition duration-300 group-open:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-labelledby="title-ac13 desc-ac13"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </summary>

              <div className={"flex justify-between mt-4"}>
                <form onSubmit={mounData}>
                  <input type="hidden" name="data_id" value={patient.ID} />
                  {isMounting ? (
                    <button
                      type="button"
                      disabled
                      class="inline-flex items-center justify-center h-6 gap-2 px-4 text-xs font-medium tracking-wide text-black transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-blue-200"
                    >
                      <span>Loading</span>
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
                          <desc id="desc-15">
                            A more detailed description of the icon
                          </desc>
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
                  ) : (
                    <button
                      type="submit"
                      class="mr-1 inline-flex items-center justify-center h-6 gap-2 px-4 text-xs font-medium tracking-wide text-black transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-blue-200 hover:bg-blue-500 focus:bg-blue-500 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
                    >
                      <span>Load</span>
                    </button>
                  )}
                </form>
                <div class="">
                  <button class="mr-1 inline-flex items-center justify-center h-6 gap-2 px-4 text-xs font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 disabled:shadow-none">
                    <span>Edit</span>
                  </button>
                  <Modal_delete
                    patient_ID={patient.ID}
                    handle_delete={handle_delete}
                  />
                </div>
              </div>
              <p className=" mt-2 text-slate-500">
                <p class="text-sm pl-3 border py-1.5">
                  <span className="font-bold inline-block w-[105px]">
                    Header File:
                  </span>
                  {patient.header}
                </p>
                <p class="text-sm pl-3 border py-1.5">
                  <span className="font-bold inline-block w-[105px]">
                    Data File:{" "}
                  </span>
                  {patient.data}
                </p>
              </p>
            </details>
          </div>
        ))}
      </section>
      {!isListing && dataList.length === 0 && (
        <span className="text-sm ">No data available</span>
      )}

      {isListing && <span class="loader_data"></span>}

      {/*<!-- End Elevated accordion --> */}
    </>
  );
}
