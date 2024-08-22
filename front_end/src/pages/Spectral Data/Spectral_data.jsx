import { ImFolderUpload } from "react-icons/im";
import Accordion_PD from "./Accordion_PD";
import { Link } from "react-router-dom";
const Spectral_data = (props) => {
  return (
    <div>
      <div className="w-[80%] mx-auto  mt-[13%]">
        <div className="text-right">
          <Link to="/data/upload">
            <button
              type="button"
              class="mb-2 py-2 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-sm border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              New Data
              <ImFolderUpload />
            </button>
          </Link>
        </div>
        <Accordion_PD host={props.host} DataMounted={props.DataMounted} />
      </div>
    </div>
  );
};

export default Spectral_data;
