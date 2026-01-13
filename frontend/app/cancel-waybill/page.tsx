"use client";
import axios from "axios";
import { useState } from "react";
function CancelWaybill() { 
const [awbNo, setAwbNo] = useState("");
const[message, setMessage]=useState("");

const downloadTemplate=async()=>{

    try {
        const response =await axios.get("https://musical-meme-wrpww4pgjq6639x99-8080.app.github.dev/api/bluedart/waybill/cancel/template",{responseType:"blob"});
        const blob=new Blob([response.data],{
             type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url=window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href=url;
    link.download="Bluedart_Cancel_Waybill_Template.xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();
    
    } catch(error) {
        console.error("Download error :",error);
        alert("Failed to download template");
    }
};

const cancelWaybill = async () => {

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/cancel?awbNo=${awbNo}`);
        const result=response.data.CancelWaybillResult;
        setMessage(result.Status[0].StatusInformation);
    } catch (error) {
        setMessage("Error cancelling waybill");
    } 
   
};

return (
    <div className="m-5">
        <h1 className="text-xl font-bold ml-10">Cancel Waybill</h1>

        <button onClick={downloadTemplate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-10">
  Download Bulk Template
</button>


        <input type="text"
            value={awbNo}
            onChange={(e) => setAwbNo(e.target.value)}
            placeholder="Enter AWB Number"
            className="m-4 p-2 border border-gray-300 rounded"
            minLength={10}
            required
        />
        <div>
        <button onClick={cancelWaybill} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-10">Cancel Waybill</button>
        </div>
        {message && <p>{message}</p>}
    </div>
);
}
export default CancelWaybill;
