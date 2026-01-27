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
    <div className="m-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Cancel Waybill</h1>

      {/* -------- MODE TOGGLE -------- */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded ${
            mode === "single"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Single AWB
        </button>

        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded ${
            mode === "bulk"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Bulk Upload
        </button>
      </div>

      {/* -------- SINGLE CANCEL -------- */}
      {mode === "single" && (
        <div>
          <input
            type="text"
            value={awbNo}
            onChange={(e) => setAwbNo(e.target.value)}
            placeholder="Enter AWB Number"
            className="p-2 border rounded w-64"
            minLength={10}
          />

          <div>
            <button
              onClick={cancelWaybill}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
            >
              Cancel Waybill
            </button>
          </div>

          {message && <p className="mt-3">{message}</p>}
        </div>
      )}

      {/* -------- BULK CANCEL -------- */}
      {mode === "bulk" && (
        <div>
          <button
            onClick={downloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ⬇️ Download Template
          </button>

          <div className="flex items-center gap-3 mt-5">
            <input
              id="bulkFile"
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <label
              htmlFor="bulkFile"
              className="cursor-pointer bg-gray-200 px-4 py-2 rounded"
            >
              Browse…
            </label>

            <span className="text-sm">
              {file ? file.name : "No file selected"}
            </span>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-5 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-60"
          >
            Upload & Cancel
          </button>

          {loading && <p>Uploading... {progress}%</p>}

          {result && (
            <div className="mt-6">
              <p>Total: {result.total}</p>
              <p>Success: {result.success}</p>
              <p>Failed: {result.failed}</p>

              <table className="mt-3 border">
                <thead>
                  <tr>
                    <th>AWB No</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r: any, i: number) => (
                    <tr key={i}>
                      <td>{r.awbNo}</td>
                      <td>{r.status}</td>
                      <td>{r.message}</td>
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
