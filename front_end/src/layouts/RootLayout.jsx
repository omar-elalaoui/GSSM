import { useLocation } from "react-router-dom";
import Sidebar from "./sidebar";

function RootLayout({ children }) {
  const location = useLocation();

  let cls = "ml-[18rem]";

  return (
    <div className="flex gap-4">
      <Sidebar />
      <main className={"p-4 my-4 w-full mr-4 bg-white mb-4 shadow-lg " + cls}>
        <div className="min-h-[130vh]">{children}</div>
      </main>
    </div>
  );
}

export default RootLayout;
