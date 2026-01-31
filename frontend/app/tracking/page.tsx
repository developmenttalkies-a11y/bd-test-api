"use client";

import { useState } from "react";
import { trackShipment } from "../lib/tracking";

export default function TrackingPage() {
  const [awb, setAwb] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await trackShipment(awb);
      console.log("TRACKING RESPONSE:", result); // 👈 DEBUG
      setData(result);
    } catch (e) {
      setError("Unable to fetch tracking details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECT DATA ACCESS
  const shipment = data?.Shipment;

  // ✅ SAFETY: ScanDetail can be array OR object
  const scansRaw = shipment?.Scans?.ScanDetail;
  const scans = Array.isArray(scansRaw)
    ? scansRaw
    : scansRaw
    ? [scansRaw]
    : [];

  return (
  <div className="mx-auto max-w-3xl p-6">
    {/* PAGE HEADER */}
    <h1 className="text-3xl font-bold tracking-tight mb-6">Track Your Shipment</h1>

    {/* SEARCH BAR */}
    <div className="flex items-center gap-3 mb-8">
      <input
        value={awb}
        onChange={(e) => setAwb(e.target.value)}
        placeholder="Enter AWB number"
        className="flex-1 h-11 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                   focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
      />

      <button
        onClick={handleTrack}
        className="h-11 px-6 bg-blue-600 text-white text-sm font-semibold rounded-md shadow
                   hover:bg-blue-700 transition"
      >
        Track
      </button>
    </div>

    {/* STATUS MESSAGES */}
    {loading && (
      <p className="text-sm text-gray-600 mb-4">Tracking shipment… please wait.</p>
    )}

    {error && (
      <p className="text-sm text-red-600 mb-4 font-medium">{error}</p>
    )}

    {/* DEBUG (optional) */}
    {data && (
      <pre className="text-xs bg-gray-50 p-3 rounded border mb-6 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    )}

    {/* ---------------- SHIPMENT INFO ---------------- */}
    {shipment && (
      <div className="space-y-6">

        {/* SHIPMENT SUMMARY */}
        <div className="border rounded-lg bg-white shadow-sm p-5">
          <h2 className="text-xl font-bold mb-2">
            Status: <span className="text-blue-700">{shipment.Status}</span>
          </h2>

          <p className="text-gray-700">
            {shipment.Origin} ({shipment.OriginAreaCode}) →{" "}
            {shipment.Destination} ({shipment.DestinationAreaCode})
          </p>

          <p className="text-sm mt-2">
            <strong>Expected Delivery:</strong>{" "}
            {shipment.ExpectedDeliveryDate || "—"}
          </p>

          {shipment.Instructions && (
            <p className="text-sm text-gray-600 mt-1">{shipment.Instructions}</p>
          )}
        </div>

        {/* TRACKING HISTORY */}
        <div className="border rounded-lg bg-white shadow-sm p-5">
          <h3 className="text-lg font-semibold mb-4">Tracking History</h3>

          <ul className="relative border-l border-gray-300 ml-4 space-y-6">
            {scans.map((scan, idx) => (
              <li key={idx} className="ml-4 relative">
                {/* timeline dot */}
                <span className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-blue-600"></span>

                <p className="font-medium text-gray-900">{scan.Scan}</p>
                <p className="text-sm text-gray-600">
                  {scan.ScanDate} {scan.ScanTime}
                </p>
                <p className="text-sm text-gray-500">{scan.ScannedLocation}</p>
              </li>
            ))}
          </ul>
        </div>

      </div>
    )}
  </div>
);

}
