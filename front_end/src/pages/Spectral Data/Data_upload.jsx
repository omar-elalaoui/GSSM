import { FaCloudUploadAlt } from "react-icons/fa";
import { MdUploadFile } from "react-icons/md";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Data_upload = (props) => {
  const [hdFile, setHdFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleHdFileChange = (event) => {
    setHdFile(event.target.files[0]);
  };
  const handleDataFileChange = (event) => {
    setDataFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProgress(0.01);
    const formData = new FormData();
    formData.append("data_name", event.target["data_name"].value);
    formData.append("hdFile", hdFile);
    formData.append("dataFile", dataFile);

    try {
      const response = await axios.post(props.host + "/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
          if (percentCompleted === 100) {
            setLoading(true);
            setProgress(-1);
          }
        },
      });
      setProgress(-1);
      if (response.data.status === "error") {
        setError(response.data.message);
      } else {
        navigate("/data");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };
  return (
    <div>
      <div className="mt-20"></div>
      <div className="w-[80%] mx-auto">
        <h2 className="py-5 text-xl text-center mb-4 w-full bg-[#ecf0f1]">
          Spectral Data
        </h2>
      </div>

      <div className="w-[80%] mx-auto shadow-lg px-10 py-5 border">
        <form onSubmit={handleSubmit}>
          {error ? (
            <div
              class="mb-4 flex items-start w-full gap-4 px-4 py-3 text-sm text-pink-500 border border-pink-100 rounded bg-pink-50"
              role="alert"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
                role="graphics-symbol"
                aria-labelledby="title-04 desc-04"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{error} !</p>
            </div>
          ) : (
            ""
          )}

          <div class="relative inline-flex items-center w-full gap-2 my-1 text-sm border  border-slate-400 text-slate-500">
            <input
              required
              id="file-upload_rs"
              name="hdFile"
              type="file"
              class="peer order-2 [&::file-selector-button]:hidden"
              onChange={handleHdFileChange}
            />
            <label
              for="file-upload_rs"
              class="w-[24%] inline-flex items-center  h-10 gap-2 px-5 text-sm font-medium tracking-wide text-black transition duration-300 cursor-pointer whitespace-nowrap bg-[#ff771c] hover:bg-[#f75e00] focus:bg-[#f75e00] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300"
            >
              <span class="order-2">Upload Header File</span>
              <span class="relative">
                <MdUploadFile size={20} />
              </span>
            </label>
          </div>
          <div class="relative inline-flex items-center w-full gap-2 my-1 text-sm border  border-slate-400 text-slate-500">
            <input
              id="file-upload_rd1"
              name="dataFile"
              type="file"
              class="peer order-2 [&::file-selector-button]:hidden"
              onChange={handleDataFileChange}
            />
            <label
              for="file-upload_rd1"
              class="w-[24%] inline-flex items-center  h-10 gap-2 px-5 text-sm font-medium tracking-wide text-black transition duration-300 cursor-pointer whitespace-nowrap bg-[#ff771c] hover:bg-[#f75e00] focus:bg-[#f75e00] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300"
            >
              <span class="order-2">Upload Data File</span>
              <span class="relative">
                <MdUploadFile size={20} />
              </span>
            </label>
          </div>

          <div className="mt-5">Coordinates</div>
          <div className="flex my-1">
            <div class="relative mr-2">
              <input
                id="id-b03"
                type="text"
                name="id-b03"
                placeholder="your name"
                class="relative w-full h-10 px-4 text-sm placeholder-transparent transition-all border rounded outline-none focus-visible:outline-none peer border-slate-200 text-slate-500 autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-orange-500 focus:outline-none invalid:focus:border-pink-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              <label
                for="id-b03"
                class="cursor-text peer-focus:cursor-default peer-autofill:-top-2 absolute left-2 -top-2 z-[1] px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-required:after:text-pink-500 peer-required:after:content-['\00a0*'] peer-invalid:text-pink-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-orange-500 peer-invalid:peer-focus:text-pink-500 peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
              >
                Latitude
              </label>
            </div>
            <div class="relative">
              <input
                id="id-b03"
                type="text"
                name="id-b03"
                placeholder="your name"
                class="relative w-full h-10 px-4 text-sm placeholder-transparent transition-all border rounded outline-none focus-visible:outline-none peer border-slate-200 text-slate-500 autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-orange-500 focus:outline-none invalid:focus:border-pink-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              <label
                for="id-b03"
                class="cursor-text peer-focus:cursor-default peer-autofill:-top-2 absolute left-2 -top-2 z-[1] px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-required:after:text-pink-500 peer-required:after:content-['\00a0*'] peer-invalid:text-pink-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-orange-500 peer-invalid:peer-focus:text-pink-500 peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
              >
                Longitude
              </label>
            </div>
          </div>

          <div class="relative mb-2 mt-3">
            <input
              id="patientTag"
              required
              type="text"
              name="data_name"
              placeholder="Name"
              defaultValue={hdFile ? hdFile.name.slice(0, -4) : ""}
              class="relative w-full h-10 px-4 text-sm placeholder-transparent transition-all border rounded outline-none focus-visible:outline-none peer border-slate-200 text-slate-500 autofill:bg-white  focus:border-[#ff771c] focus:outline-none  disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
            <label
              for="patientTag"
              class="cursor-text peer-focus:cursor-default peer-autofill:-top-2 absolute left-2 -top-2 z-[1] px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm  peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#ff771c] peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
            >
              Data Tag
            </label>
          </div>
          {progress > 0 && progress != -1 ? (
            <div class="relative w-full mt-3">
              <label
                id="p02c-label"
                for="p02c"
                class="block mb-1 text-xs text-center text-slate-500"
              >
                Uploading...
              </label>
              <div class="relative w-full">
                <label
                  id="p02d-label"
                  for="p02d"
                  class="absolute top-0 left-0 block w-full mb-0 text-xs text-center text-black font-semibold"
                >
                  {progress}%
                </label>
                <progress
                  aria-labelledby="p02d-label"
                  id="p02d"
                  max="100"
                  value={progress}
                  class="block w-full overflow-hidden rounded bg-slate-100 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-[#1d4ed8] [&::-moz-progress-bar]:bg-[#1d4ed8]"
                ></progress>
              </div>
            </div>
          ) : (
            ""
          )}

          {progress > 0 || loading ? (
            ""
          ) : (
            <div class="mt-5 text-center">
              <button
                type="submit"
                class="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-semibold tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
              >
                <span>Upload</span>
                <span class="relative only:-mx-5">
                  <FaCloudUploadAlt size={20} />
                </span>
              </button>
            </div>
          )}
          {loading ? (
            <div className="text-center mt-2">
              <div class="text-sm text-slate-500">Initial Processing</div>
              <div class="loader_ld0 inline-block"></div>
            </div>
          ) : (
            ""
          )}
        </form>
      </div>
    </div>
  );
};

export default Data_upload;
