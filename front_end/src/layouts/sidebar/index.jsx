import { useRef } from "react";
import SubMenu from "./SubMenu";
import { motion } from "framer-motion";
import clever from "../../assets/clever.png";
import gsmi_logo from "../../assets/GSMI.png";

// * React icons
import { GiProcessor } from "react-icons/gi";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { TbFilterCog } from "react-icons/tb";
import { FaDatabase } from "react-icons/fa";
import { AiOutlineAppstore } from "react-icons/ai";

// import { useMediaQuery } from "react-responsive";
import { MdMenu } from "react-icons/md";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const sidebarRef = useRef();

  const subMenusList = [
    {
      name: "Visualization",
      icon: FaMagnifyingGlassChart,
      menus: [
        "Single-Pixel Signature",
        "Multi-Pixels Signature",
        "Region-based Signature",
        "Line-based Signature",
      ],
    },
    {
      name: "Preprocessing",
      icon: TbFilterCog,
      menus: ["Filtering"],
    },
    {
      name: "Processing",
      icon: GiProcessor,
      menus: ["Supervised", "Unsupervised", "Band Ratio"],
    },
  ];

  return (
    <div className="fixed">
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 max-h-screen z-[998] bg-black/50 ${
          open ? "block" : "hidden"
        } `}
      ></div>
      <motion.div
        ref={sidebarRef}
        // variants={Nav_animation}
        // initial={{ x: isTabletMid ? -250 : 0 }}
        // animate={open ? "open" : "closed"}
        className=" bg-white text-gray shadow-xl z-[999] max-w-[17rem]  w-[17rem] 
            overflow-hidden md:relative fixed h-screen"
      >
        <a href="/Home">
          <div className="flex items-center mt-8 mx-3">
            <img src={clever} width={210} />
          </div>
        </a>
        <a href="/Home">
          <div className="flex justify-end mx-3 -mt-6">
            <img src={gsmi_logo} width={80} />
          </div>
        </a>

        <div className="flex flex-col mt-[4rem] h-full">
          <ul className="nav_list_gs whitespace-pre px-2.5 text-[0.9rem] py-5 flex flex-col gap-1  font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100   md:h-[68%] h-[70%]">
            <li>
              <NavLink to={"/home"} className="link">
                <AiOutlineAppstore size={23} className="min-w-max" />
                Home
              </NavLink>
            </li>
            {/* {(open || isTabletMid) && ( */}
            <div className="border-y py-5 border-slate-300 ">
              <small className="pl-3 text-slate-500 inline-block mb-2">
                Process path
              </small>
              {subMenusList?.map((menu) => (
                <div key={menu.name} className="flex flex-col gap-1">
                  <SubMenu data={menu} />
                </div>
              ))}
            </div>
            {/* // )} */}

            <li>
              <NavLink to={"/data"} className="link">
                <FaDatabase size={23} className="min-w-max" />
                Data
              </NavLink>
            </li>
          </ul>
        </div>
      </motion.div>
      <div className="m-3 md:hidden  " onClick={() => setOpen(true)}>
        <MdMenu size={25} />
      </div>
    </div>
  );
};

export default Sidebar;
