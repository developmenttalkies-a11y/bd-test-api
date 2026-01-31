"use client";
import { useState } from "react";

type PickupForm = {
  customerCode: string;
  customerPincode: string;
  contactPersonName: string;
  customerAddress1:string;
  customerAddress2:string;
  customerAddress3:string;
  shipmentWeight:number;
  noOfPiece:number;

};

type PickupResponse = {
  RegisterPickupResult?: {
    TokenNumber: string;
  };
};

export default function Pickup() {
  const [form, setForm] = useState<PickupForm>({
    customerCode: "",
    customerPincode: "",
    contactPersonName: "",
    customerAddress1:"",
    customerAddress2:"",
    customerAddress3:"",
    shipmentWeight:0,
    noOfPiece:0
  });

  const [loading, setLoading] = useState(false);

  async function registerPickup(
    data: unknown
  ): Promise<PickupResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pickup/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  }

  const submit = async () => {
    if (!form.customerCode || !form.customerPincode) {
      alert("Customer Code and Pincode are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        request: {
          AWBNo: [""],
          AreaCode: "BOM",
          CISDDN: false,
          ContactPersonName: form.contactPersonName,
          CustomerAddress1: form.customerAddress1,
          CustomerAddress2: form.customerAddress2,
          CustomerAddress3: form.customerAddress3,
          CustomerCode: form.customerCode,
          CustomerName: form.contactPersonName,
          CustomerPincode:form.customerPincode,
          CustomerTelephoneNumber: "",
          DoxNDox: "?",
          EmailID: "",
          IsForcePickup: false,
          IsReversePickup: false,
          MobileTelNo: "",
          NumberofPieces: form.noOfPiece,
          OfficeCloseTime: "1800",
          PackType: "",
          ProductCode: "A",
          ReferenceNo: "xyz01",
          Remarks: "",
          RouteCode: "",
          ShipmentPickupDate: `/Date(${Date.now()})/`,
          ShipmentPickupTime: "1200",
          SubProducts: ["E-Tailing"],
          VolumeWeight: 1,
          WeightofShipment: form.shipmentWeight,
          isToPayShipper: false,
        },
        profile: {
          LoginID: "GG940111",
          LicenceKey: "kh7mnhqkmgegoksipxr0urmqesesseup",
          Api_type: "S",
        },
      };

      const res = await registerPickup(payload);

      alert(
        "Pickup Registered. Token: " +
          res?.RegisterPickupResult?.TokenNumber
      );
    } catch (err: any) {
      alert(
        err?.["error-response"]?.[0]?.StatusInformation ||
          err?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="mx-auto max-w-xl p-6">
    {/* PAGE TITLE */}
    <h1 className="text-3xl font-bold tracking-tight mb-6">
      Register Pickup
    </h1>

    <div className="rounded-lg border bg-white shadow-sm p-6 space-y-5">

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Customer Code */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Customer Code
          </label>
          <input
            placeholder="Customer Code"
            value={form.customerCode}
            onChange={(e) =>
              setForm({ ...form, customerCode: e.target.value })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Pincode */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Pincode
          </label>
          <input
            placeholder="Pincode"
            value={form.customerPincode}
            onChange={(e) =>
              setForm({ ...form, customerPincode: e.target.value })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Contact Person */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Contact Person Name
          </label>
          <input
            placeholder="Contact Person Name"
            value={form.contactPersonName}
            onChange={(e) =>
              setForm({ ...form, contactPersonName: e.target.value })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Address 1 */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Address Line 1
          </label>
          <input
            placeholder="Address Line 1"
            value={form.customerAddress1}
            onChange={(e) =>
              setForm({ ...form, customerAddress1: e.target.value })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Address 2 */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            placeholder="Address Line 2"
            value={form.customerAddress2}
            onChange={(e) =>
              setForm({ ...form, customerAddress2: e.target.value })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Address 3 */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Address Line 3
          </label>
          <input
            placeholder="Address Line 3"
            value={form.customerAddress3}
            onChange={(e) =>
              setForm({ ...form, customerAddress3: e.target.value })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        {/* Shipment Weight */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Weight of Shipment (kg)
          </label>
          <input
            placeholder="Weight (kg)"
            value={form.shipmentWeight}
            onChange={(e) =>
              setForm({ ...form, shipmentWeight: parseFloat(e.target.value) })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            type="number"
          />
        </div>

        {/* No of Pieces */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            No. of Pieces
          </label>
          <input
            placeholder="No. of Pieces"
            value={form.noOfPiece}
            onChange={(e) =>
              setForm({ ...form, noOfPiece: Number(e.target.value) })
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            type="number"
          />
        </div>

      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full h-11 bg-green-600 text-white rounded-md text-sm font-semibold shadow
                   hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Pickup"}
      </button>

    </div>
  </div>
);
}
