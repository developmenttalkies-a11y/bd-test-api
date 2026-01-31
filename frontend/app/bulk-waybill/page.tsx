"use client";

import { useState } from "react";

type BulkResult = {
  total: number;
  success: number;
  failed: number;
};

export default function BulkWaybillPage() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [file, setFile] = useState<File | null>(null);
  const [labelSize, setLabelSize] = useState("A4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);

  /* ---------------- TEMPLATE ---------------- */

  const downloadTemplate = () => {
    window.location.href =
      `${BACKEND}/api/bluedart/waybill/bulk/template`;
  };

  /* ---------------- BULK UPLOAD ---------------- */

  const uploadBulkFile = async () => {
    if (!file) {
      setError("Please select an XLSX or CSV file");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("size", labelSize);

    try {
      const res = await fetch(
        `${BACKEND}/api/bluedart/waybill/bulk`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Bulk upload failed. Please check the file.");
      }

      const data: BulkResult = await res.json();
      setResult(data);

      // reset file after success
      setFile(null);

    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
  <main className="max-w-4xl mx-auto p-6">

    {/* PAGE TITLE */}
    <h1 className="text-3xl font-bold tracking-tight mb-8">
      Bluedart Bulk Waybill Generator
    </h1>

    {/* DOWNLOAD TEMPLATE */}
    <div className="mb-8">
      <button
        onClick={downloadTemplate}
        className="bg-green-600 text-white px-5 py-2.5 rounded-md shadow hover:bg-green-700 transition font-semibold"
      >
        ⬇️ Download XLSX Template
      </button>
    </div>

    {/* UPLOAD CARD */}
    <div className="border rounded-lg bg-white shadow-sm p-6">

      <h3 className="text-xl font-semibold mb-5">Upload Filled Template</h3>

      {/* FILE PICKER */}
      <div className="mb-6">
        <label className="block font-medium mb-2">Upload File (XLSX / CSV)</label>

        <div className="flex items-center gap-3">
          <input
            id="bulkFile"
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          <label
            htmlFor="bulkFile"
            className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium border shadow-sm transition"
          >
            Browse…
          </label>

          <span className="text-sm text-gray-700 truncate max-w-xs">
            {file ? file.name : "No file selected"}
          </span>
        </div>
      </div>

      {/* LABEL SIZE SELECT */}
      <div className="mb-6">
        <label className="block font-medium mb-2">Label Size</label>

        <select
          value={labelSize}
          onChange={(e) => setLabelSize(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm shadow-sm outline-none
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
        >
          <option value="A4">A4</option>
          <option value="LABEL_4X6">4 x 6</option>
        </select>
      </div>

      {/* SUBMIT */}
      <button
        onClick={uploadBulkFile}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-md shadow hover:bg-blue-700 
                   disabled:opacity-50 transition font-semibold"
      >
        {loading ? "Processing..." : "Upload & Generate"}
      </button>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-5 bg-red-100 text-red-700 p-4 rounded-md border border-red-300">
          ❌ {error}
        </div>
      )}
    </div>

    {/* RESULTS */}
    {result && (
      <div className="mt-8 border rounded-lg bg-green-50 p-6 shadow-sm">
        <h3 className="font-semibold text-xl mb-4">Bulk Processing Result</h3>

        <div className="text-sm space-y-1">
          <p>Total Records: <b>{result.total}</b></p>
          <p className="text-green-600">Success: <b>{result.success}</b></p>
          <p className="text-red-600">Failed: <b>{result.failed}</b></p>
        </div>

        {/* DOWNLOAD LINKS */}
        <div className="mt-6 space-y-3 text-sm">

          {result.success > 0 && (
            <>
              <a
                href={`${BACKEND}/api/bluedart/waybill/bulk/pdf`}
                target="_blank"
                className="block text-blue-600 underline hover:text-blue-800"
              >
                📄 Download Success Labels (PDF)
              </a>

              <a
                href={`${BACKEND}/api/bluedart/waybill/bulk/success`}
                target="_blank"
                className="block text-blue-600 underline hover:text-blue-800"
              >
                📊 Download Success Records (Excel)
              </a>
            </>
          )}

          {result.failed > 0 && (
            <a
              href={`${BACKEND}/api/bluedart/waybill/bulk/failure`}
              target="_blank"
              className="block text-blue-600 underline hover:text-blue-800"
            >
              📊 Download Failure Records (Excel)
            </a>
          )}
        </div>
      </div>
    )}

  </main>
);

}
