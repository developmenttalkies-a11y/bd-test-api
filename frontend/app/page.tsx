 "use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [awb, setAwb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labelSize, setLabelSize] = useState<Record<string, string>>({});



  const [form, setForm] = useState({
    // Shipper
    customerCode: "940111",
    originArea: "GGN",
    shipperName: "Test Cust Name",
    shipperMobile: "9996665554",
    shipperPincode: "122002",

    // Consignee
    consigneeName: "",
    consigneeMobile: "",
    consigneePincode: "",
    consigneeAddr1: "",
    consigneeAddr2: "",
    consigneeAddr3: "",

    // Shipment
    productCode: "",
    subProductCode: "",
    packType: "",
    weight: "",
    declaredValue: "",
    pickupTime: "1600",

    // COD
    codAmount: "",

    // Item
    itemName: "",
    itemQty: "1",
    itemValue: "",
  });

  const [waybills, setWaybills] = useState<any[]>([]);

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybills`)
    .then(res => res.json())
    .then(setWaybills);
}, []);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    if (!form.consigneeName) return "Consignee name is required";
    if (!/^\d{10}$/.test(form.consigneeMobile))
      return "Consignee mobile must be 10 digits";
    if (!/^\d{6}$/.test(form.consigneePincode))
      return "Consignee pincode must be 6 digits";
    if (!form.consigneeAddr1) return "Consignee address is required";

    if (!form.productCode) return "Select Product Code";
    //if (!form.subProductCode) return "Select Sub Product Code";

    if (Number(form.weight) <= 0) return "Weight must be greater than 0";
    if (Number(form.declaredValue) <= 0)
      return "Declared value must be greater than 0";

    if (!form.itemName) return "Item name is required";

    // ✅ COD validation
    if (form.subProductCode === "C") {
      if (!form.codAmount) return "COD amount is required";
      if (Number(form.codAmount) <= 0)
        return "COD amount must be greater than 0";
    }

    // if (form.subProductCode === "B") {
    //   return "FODDOD service is currently unavailable";
    // }

    return null;
  };

  /* ---------------- API CALL ---------------- */

  const generateWaybill = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setAwb(null);

    const payload = {
      Request: {
        Consignee: {
          AvailableDays: "",
          AvailableTiming: "",
          ConsigneeAddress1: form.consigneeAddr1,
          ConsigneeAddress2: form.consigneeAddr2 || "NA",
          ConsigneeAddress3: form.consigneeAddr3 || "NA",
          ConsigneeAttention: "ABCD",
          ConsigneeEmailID: "testemail@bluedart.com",
          ConsigneeMobile: form.consigneeMobile,
          ConsigneeName: form.consigneeName,
          ConsigneePincode: form.consigneePincode,
          ConsigneeTelephone: "",
        },

        Returnadds: {
          ReturnAddress1: "Test RTO Addr1",
          ReturnAddress2: "Test RTO Addr2",
          ReturnAddress3: "Test RTO Addr3",
          ReturnContact: "Test RTO",
          ReturnMobile: "9995554447",
          ReturnPincode: "400057",
        },

        Services: {
          AWBNo: "",
          ActualWeight: form.weight,

          // ✅ COD logic here
          CollectableAmount:
            form.subProductCode === "C" || form.subProductCode === "B" || form.subProductCode === "D" 
              ? Number(form.codAmount)
              : 0,

          Commodity: {
            CommodityDetail1: "General Goods",
          },

          CreditReferenceNo: "CR-" + Date.now(),
          DeclaredValue: Number(form.declaredValue),

          Dimensions: [
            {
              Breadth: 32.7,
              Count: 1,
              Height: 3.2,
              Length: 28.9,
            },
          ],
          FavouringName:"XYZ",
          ForwardAWBNo: "",
          ForwardLogisticCompName: "",
          InsurancePaidBy: "",
          InvoiceNo: "",
          IsChequeDD: "D",
          PayableAt: "ROORKEE",
          IsDedicatedDeliveryNetwork: false,
          IsForcePickup: false,
          IsPartialPickup: false,
          IsReversePickup: false,
          ItemCount: 1,
          PDFOutputNotRequired: true,
          PackType: form.packType,
          PickupDate: "/Date(1742978555000)/",
          PickupTime: form.pickupTime,
          PieceCount: "1",
          ProductCode: form.productCode,
          ProductType: 1,
          RegisterPickup: true,
          SubProductCode: form.subProductCode,

          itemdtl: [
            {
              ItemName: form.itemName,
              Itemquantity: Number(form.itemQty),
              ItemValue: Number(form.itemValue),
              TotalValue: Number(form.itemValue),
            },
          ],

          noOfDCGiven: 0,
        },

        Shipper: {
          CustomerAddress1: "Test Cust Addr1",
          CustomerAddress2: "Test Cust Addr2",
          CustomerAddress3: "Test Cust Addr3",
          CustomerCode: form.customerCode,
          CustomerMobile: form.shipperMobile,
          CustomerName: form.shipperName,
          CustomerPincode: form.shipperPincode,
          IsToPayCustomer: false,
          OriginArea: form.originArea,
        },
      },

      Profile: {
        LoginID: "GG940111",
        LicenceKey: "kh7mnhqkmgegoksipxr0urmqesesseup",
        Api_type: "S",
      },
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybill`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setAwb(data.GenerateWayBillResult.AWBNo);
    } catch {
      setError("Bluedart rejected the request. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

//   return (
//     <main className="max-w-4xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">
//         Bluedart Waybill Generator
//       </h1>
// <a
//   href="/bulk-waybill"
//   className="text-blue-600 underline text-sm"
// >
//   → Switch to Bulk Waybill Generator
// </a>

// <a
//   href="/cancel-waybill"
//   className="text-blue-600 underline text-sm m-10"
// >
//   → Go to cancel waybills
// </a>


//       <div className="grid grid-cols-2 gap-4">
//         <input name="consigneeName" placeholder="Consignee Name" onChange={handleChange} />
//         <input name="consigneeMobile" placeholder="Consignee Mobile" onChange={handleChange} />
//         <input name="consigneePincode" placeholder="Consignee Pincode" onChange={handleChange} />
//         <input name="consigneeAddr1" placeholder="Address Line 1" onChange={handleChange} />

//         <select name="productCode" onChange={handleChange}>
//           <option value="">Select Product Code</option>
//           <option value="A">A – Air Express</option>
//           <option value="E">E – Express (Road)</option>
//           <option value="D">Domestic Priority</option>
//         </select>

//         <select name="subProductCode" onChange={handleChange}>
//           <option value="">Select Sub Product</option>
//           <option value="P">P-PREPAID</option>
//           <option value="C">C-COD</option>
//           <option value="A">A-FODPREPAID</option>
//           <option value="B">B-FODDOD</option>
//           <option value="D">D-DOD</option>
//         </select>

//         {/* ✅ Show COD field ONLY when COD selected */}
//         {(form.subProductCode === "C" || form.subProductCode === "B" || form.subProductCode === "D") && (
//           <input
//             name="codAmount"
//             placeholder="COD Amount"
//             onChange={handleChange}
//           />
//         )}

//         <select name="packType" onChange={handleChange}>
//           <option value="">Select Pack Type (Optional)</option>
//           <option value="L">L</option>
//         </select>

//         <input name="weight" placeholder="Weight (kg)" onChange={handleChange} />
//         <input name="declaredValue" placeholder="Declared Value" onChange={handleChange} />
//         <input name="itemName" placeholder="Item Name" onChange={handleChange} />
//       </div>
       
//       <button
//         onClick={generateWaybill}
//         disabled={loading}
//         className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
//       >
//         {loading ? "Generating..." : "Generate Waybill"}
//       </button>

//       {awb && (
//         <div className="mt-6 bg-green-100 p-4 rounded">
//           ✅ Waybill Generated: <b>{awb}</b>
//         </div>
//       )}

//       {error && (
//         <div className="mt-6 bg-red-100 p-4 rounded">
//           ❌ {error}
//         </div>
//       )}

//       <table className="mt-8 w-full border">
//   <thead>
//     <tr className="bg-gray-100">
//       <th className="p-2 border">AWB</th>
//       <th className="p-2 border">Reference</th>
//       <th className="p-2 border">Date</th>
//       <th className="p-2 border">Action</th>
//       <th className="p-2 border">Size</th>
//     </tr>
//   </thead>
//   <tbody>
//     {waybills.map(w => (
//       <tr key={w.awbNo}>
//         <td className="border p-2">{w.awbNo}</td>
//         <td className="border p-2">{w.creditReferenceNo}</td>
//         <td className="border p-2">
//           {new Date(w.createdAt).toLocaleDateString()}
//         </td>
//         <td className="border p-2">
//           <a
//             href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybill/${w.awbNo}/pdf?size=${labelSize[w.awbNo] || "A4"}`}
//             className="text-blue-600 underline"
//           >
//             Download PDF
//           </a>
//         </td>
//         <td>
//           <select 
//       value={labelSize[w.awbNo] || "A4"} 
//       onChange={e => setLabelSize(prev=>({...prev,[w.awbNo]:e.target.value}))} 
//       className="m-2 border p-2 rounded">
//         <option value="A4">lbl-A4</option>
//         <option value="LABEL_4X6">lbl-4x6</option>
//       </select>
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </table>
//     </main>
//   );

return (
  <main className="max-w-7xl mx-auto p-6 text-sm">
    <h1 className="text-2xl font-bold text-center mb-6">
      Book A Shipment
    </h1>

    {/* ================= SHIPPER ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Shipper</legend>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <input name="customerCode" placeholder="Customer Code" onChange={handleChange} />
        <input name="shipperName" placeholder="Shipper Name" onChange={handleChange} />
        <input placeholder="Sender Name" />
      </div>

      <fieldset className="border p-3">
        <legend className="px-2">Pickup Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input placeholder="Address1" />
          <input placeholder="Address2" />
          <input placeholder="Address3" />
          <input name="shipperPincode" placeholder="Pincode" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Telephone No" />
          <input name="shipperMobile" placeholder="Mobile No" onChange={handleChange} />
        </div>
      </fieldset>
    </fieldset>

    {/* ================= CONSIGNEE ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Consignee</legend>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <input name="consigneeName" placeholder="Consignee Name" onChange={handleChange} />
        <input placeholder="Receiver Name" />
      </div>

      <fieldset className="border p-3">
        <legend className="px-2">Delivery Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input name="consigneeAddr1" placeholder="Address1" onChange={handleChange} />
          <input name="consigneeAddr2" placeholder="Address2" onChange={handleChange} />
          <input name="consigneeAddr3" placeholder="Address3" onChange={handleChange} />
          <input name="consigneePincode" placeholder="Pincode" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Telephone No" />
          <input name="consigneeMobile" placeholder="Mobile No" onChange={handleChange} />
        </div>
      </fieldset>
    </fieldset>

    {/* ================= SHIPMENT DETAILS ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Shipment Details</legend>

      <div className="grid grid-cols-6 gap-3">
        <input placeholder="Ref No" />
        <input placeholder="Invoice No" />
        <input type="date" />
        <input placeholder="No Of Box" />
        <input name="declaredValue" placeholder="Dec. Value" onChange={handleChange} />
        <input name="weight" placeholder="Weight" onChange={handleChange} />
      </div>
    </fieldset>

    {/* ================= ITEM DETAILS ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Item Details</legend>

      <div className="grid grid-cols-4 gap-3">
        <input placeholder="Ref No" />
        <input name="itemName" placeholder="Item Name" onChange={handleChange} />
        <input placeholder="Product Desc1" />
        <input placeholder="Product Desc2" />
      </div>
    </fieldset>

    {/* ================= OPTIONS ROW ================= */}
    <div className="grid grid-cols-6 gap-3 mb-4">

      <fieldset className="border p-2">
        <legend>Product Code</legend>
        <select name="productCode" onChange={handleChange}>
          <option value="">Select</option>
          <option value="A">A – Air</option>
          <option value="E">E – Road</option>
          <option value="D">D – Priority</option>
        </select>
      </fieldset>

      <fieldset className="border p-2">
        <legend>SubProduct Code</legend>
        <select name="subProductCode" onChange={handleChange}>
          <option value="">Select</option>
          <option value="P">P-PREPAID</option>
          <option value="C">C-COD</option>
          <option value="B">B-FODDOD</option>
          <option value="D">D-DOD</option>
        </select>
      </fieldset>

      <fieldset className="border p-2">
        <legend>IsToPay</legend>
        <label className="mr-2">
          <input type="radio" name="istopay" /> Yes
        </label>
        <label>
          <input type="radio" name="istopay" defaultChecked /> No
        </label>
      </fieldset>

      <fieldset className="border p-2">
        <legend>Label Size</legend>
        <select>
          <option value="A4">A4</option>
          <option value="LABEL_4X6">4x6</option>
        </select>
      </fieldset>

      <fieldset className="border p-2">
        <legend>ShipmentType</legend>
        <select>
          <option value="DOC">DOC</option>
          <option value="NDOX">NDOX</option>
        </select>
      </fieldset>

      <fieldset className="border p-2 flex gap-2 items-center">
        <legend>Action</legend>
        <button
          onClick={generateWaybill}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Submit
        </button>
        <button className="bg-gray-400 text-white px-3 py-1 rounded">
          Reset
        </button>
      </fieldset>
    </div>

    {/* ================= RESPONSE ================= */}
    <fieldset className="border p-4">
      <legend className="font-semibold px-2">Response</legend>

      {awb && (
        <p className="text-green-700 font-semibold">
          ✅ Waybill Generated Successfully : {awb}
        </p>
      )}

      {error && (
        <p className="text-red-600 font-semibold">
          ❌ {error}
        </p>
      )}
    </fieldset>
  </main>
);

}
