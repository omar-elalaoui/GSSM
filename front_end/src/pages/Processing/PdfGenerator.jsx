import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const PdfGenerator = () => {
  const pdfRef = useRef();

  const generatePdf = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("download.pdf");
  };

  return (
    <div>
      <div ref={pdfRef} style={{ padding: 20, backgroundColor: "white" }}>
        <h1>Your Content</h1>
        <p>This is the content that will be converted to PDF.</p>
        {/* Add more content as needed */}
      </div>
      <button onClick={generatePdf}>Download as PDF</button>
    </div>
  );
};

export default PdfGenerator;
