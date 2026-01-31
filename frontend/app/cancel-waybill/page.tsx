"use client";
import axios from "axios";
import { useState } from "react";

export default function CancelWaybillPage() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [mode, setMode] = useState<"single" | "bulk">("single");

  /* ---------------- SINGLE CANCEL STATE ---------------- */
  const [awbNo, setAwbNo] = useState("");
  const [message, setMessage] = useState("");

  const cancelWaybill = async () => {
    try {
      const response = await axios.post(
        `${BACKEND}/api/bluedart/cancel?awbNo=${awbNo}`
      );
      const result = response.data.CancelWaybillResult;
      setMessage(result.Status[0].StatusInformation);
    } catch (error: any) {
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          setMessage(error.response.data);
          return;
        }

        const msg =
          error.response.data.CancelWaybillResult?.Status?.[0]
            ?.StatusInformation;
        setMessage(msg || "Cancellation failed");
        return;
      }
      setMessage(error.message || "Error cancelling waybill");
    }
  };

  /* ---------------- BULK CANCEL STATE ---------------- */
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);



  const downloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${BACKEND}/api/bluedart/waybill/cancel/template`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "Bluedart_Cancel_Waybill_Template.xlsx";
      link.click();
    } catch {
      alert("Failed to download template");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(0);

      const response = await axios.post(
        `${BACKEND}/api/bluedart/cancel/bulk`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          }
        }
      );

      setResult(response.data);
    } catch {
      alert("Bulk cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="mx-auto max-w-3xl p-6">
    {/* PAGE TITLE */}
    <h1 className="text-3xl font-bold mb-6 tracking-tight">Cancel Waybill</h1>

    {/* MODE SWITCH */}
    <div className="mb-6">
      <div className="inline-flex rounded-lg border bg-gray-100 p-1">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${mode === "single" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
        >
          Single AWB
        </button>

        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${mode === "bulk" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
        >
          Bulk Upload
        </button>
      </div>
    </div>

    {/* -------------------------------- SINGLE CANCEL -------------------------------- */}
    {mode === "single" && (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          AWB Number
        </label>

        <input
          type="text"
          value={awbNo}
          onChange={(e) => setAwbNo(e.target.value)}
          placeholder="Enter 10–12 digit AWB"
          className="w-72 h-10 rounded-md border border-gray-300 px-3 shadow-sm text-sm
                     outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
        />

        <button
          onClick={cancelWaybill}
          className="mt-5 bg-green-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold
                     shadow hover:bg-green-700 transition"
        >
          Cancel Waybill
        </button>

        {message && (
          <p className="mt-4 text-sm font-medium text-blue-700">{message}</p>
        )}
      </div>
    )}

    {/* -------------------------------- BULK CANCEL -------------------------------- */}
    {mode === "bulk" && (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <button
          onClick={downloadTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow
                     hover:bg-blue-700 transition"
        >
          ⬇️ Download Template
        </button>

        {/* FILE SELECT */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700">Upload Excel File</label>

          <div className="mt-2 flex items-center gap-3">
            <input
              id="bulkFile"
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <label
              htmlFor="bulkFile"
              className="cursor-pointer bg-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition"
            >
              Select File
            </label>

            <span className="text-sm text-gray-600">
              {file ? file.name : "No file selected"}
            </span>
          </div>
        </div>

        {/* UPLOAD BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold shadow
                     hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Upload & Cancel
        </button>

        {loading && (
          <p className="mt-3 text-sm text-gray-600">
            Uploading… {progress}%
          </p>
        )}

        {/* RESULTS TABLE */}
        {result && (
          <div className="mt-8">
            <p className="font-semibold">Summary</p>
            <p className="text-sm mt-1">Total: {result.total}</p>
            <p className="text-sm">Success: {result.success}</p>
            <p className="text-sm">Failed: {result.failed}</p>

            <table className="mt-4 w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border px-3 py-2">AWB No</th>
                  <th className="border px-3 py-2">Status</th>
                  <th className="border px-3 py-2">Message</th>
                </tr>
              </thead>

              <tbody>
                {result.results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{r.awbNo}</td>
                    <td className="border px-3 py-2">{r.status}</td>
                    <td className="border px-3 py-2">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </div>
);
}
