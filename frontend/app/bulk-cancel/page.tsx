"use client";
import { useState } from "react";
import axios from "axios";

function BulkCancelWaybill() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(0);

      const response = await axios.post(
        `${BACKEND}/api/bluedart/cancel/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round(
                (event.loaded * 100) / event.total
              );
              setProgress(percent);
            }
          }
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Bulk cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Bulk Waybill Cancellation</h2>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            setFile(selectedFile);
          }
        }}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        Upload & Cancel
      </button>

      {loading && <p>Uploading... {progress}%</p>}

      {result && (
        <>
          <h3>Summary</h3>
          <p>Total: {result.total}</p>
          <p>Success: {result.success}</p>
          <p>Failed: {result.failed}</p>

          <table border="1">
            <thead>
              <tr>
                <th>AWB No</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {result.results.map((r: any, idx: number) => (
                <tr key={idx}>
                  <td>{r.awbNo}</td>
                  <td>{r.status}</td>
                  <td>{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default BulkCancelWaybill;
