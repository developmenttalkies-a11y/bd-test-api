"use client";

import { useEffect, useState,useRef } from "react";
import { toBluedartDate } from "./lib/date";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [awb, setAwb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labelSize, setLabelSize] = useState<Record<string, string>>({});
  const [isReturnAddressDiffrent,setIsReturnAddressDiffrent]=useState(false);

  const refs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState({
    // Shipper
    customerCode: "940111",
    originArea: "GGN",
    shipperName: "XYZ Compnay.com",
    shipperAddress1:"123, 2nd Floor, Sai Residency",
    shipperAddress2:"4th Cross, 5th Main, Koramangala 4th Block",
    shipperAddress3:"Gurgaon, Haryana – 122001",
    shipperMobile: "9996665554",
    shipperTelephone:"",
    shipperPincode: "122001",
    sender:"Mr. Rahul Sharma",

    // return address

          returnAddress1: "",
          returnAddress2: "",
          returnAddress3: "",
          returnContact: "",
          returnMobile: "",
          returnPincode: "",

    // Consignee
    consigneeName: "",
    consigneeMobile: "",
    consigneePincode: "",
    consigneeAddr1: "",
    consigneeAddr2: "",
    consigneeAddr3: "",
    consigneeTelephone:"",
    receiver: "",

    // Shipment
    productCode: "",
    subProductCode: "",
    packType: "",
    weight: "",
    declaredValue: "",
    pickupTime: "1600",
    isTopay:false,
    creditReferenceNo:"",
    pieceCount:"",
    labelSize: "A4",
    isChequeDD:"",
    favouringName:"",
    payableAt:"",
    invoiceDate:"",
    invoiceNumber:"",
    pickupDate:"",
    comodityDetails1:"",
    comodityDetails2:"",
    comodityDetails3:"",


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
  const { name, value, type } = e.target;

  setForm(prev => ({
    ...prev,
    [name]: type === "number" ? Number(value) : value,
  }));
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

    const Returnadds = isReturnAddressDiffrent
  ? {
      ReturnAddress1: form.returnAddress1,
      ReturnAddress2: form.returnAddress2,
      ReturnAddress3: form.returnAddress3,
      ReturnContact: form.returnContact,
      ReturnMobile: form.returnMobile,
      ReturnPincode: form.returnPincode,
    }
  : {
      ReturnAddress1: form.shipperAddress1,
      ReturnAddress2: form.shipperAddress2,
      ReturnAddress3: form.shipperAddress3,
      ReturnContact: form.shipperName,
      ReturnMobile: form.shipperMobile,
      ReturnPincode: form.shipperPincode,
    };

    
    const payload = {
      Request: {
        Consignee: {
          AvailableDays: "",
          AvailableTiming: "",
          ConsigneeAddress1: form.consigneeAddr1,
          ConsigneeAddress2: form.consigneeAddr2 || "",
          ConsigneeAddress3: form.consigneeAddr3 || "",
          ConsigneeAttention: form.consigneeName,
          ConsigneeEmailID: "",
          ConsigneeMobile: form.consigneeMobile,
          ConsigneeName: form.consigneeName,
          ConsigneePincode: form.consigneePincode,
          ConsigneeTelephone: form.consigneeTelephone,
        },

        Returnadds: Returnadds,

        Services: {
          AWBNo: "",
          ActualWeight: form.weight,

          // ✅ COD logic here
          CollectableAmount:
            form.subProductCode === "C" || form.subProductCode === "B" || form.subProductCode === "D" 
              ? Number(form.codAmount)
              : 0,

          Commodity: {
            CommodityDetail1: form.comodityDetails1,
            CommodityDetail2: form.comodityDetails2,
            CommodityDetail3: form.comodityDetails3,
          },

          CreditReferenceNo: form.creditReferenceNo || "CR-" + Date.now(),
          DeclaredValue: Number(form.declaredValue),

          Dimensions: [
            {
              Breadth: 32.7,
              Count: 1,
              Height: 3.2,
              Length: 28.9,
            },
          ],

          IsReversePickup: false,
          ItemCount: 1,
          PDFOutputNotRequired: true,
          PackType: form.packType,
          PickupDate: toBluedartDate(form.pickupDate),
          PickupTime: form.pickupTime,
          PieceCount: form.pieceCount,
          ProductCode: form.productCode,
          ProductType: 1,
          RegisterPickup: true,
          SubProductCode: form.subProductCode,
          FavouringName:form.favouringName,
          IsChequeDD:form.isChequeDD,
          PayableAt:form.payableAt,
          InvoiceDate:toBluedartDate(form.invoiceDate),
          InvoiceNumber:form.invoiceNumber,

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
          CustomerAddress1: form.shipperAddress1,
          CustomerAddress2: form.shipperAddress2 || "",
          CustomerAddress3: form.shipperAddress3,
          CustomerCode: form.customerCode,
          CustomerMobile: form.shipperMobile,
          CustomerTelephone:form.shipperTelephone,
          CustomerName: form.shipperName,
          CustomerPincode: form.shipperPincode,
          IsToPayCustomer: form.isTopay,
          OriginArea: form.originArea,
          Sender:form.sender,
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

// const handleKeyDown = (
//   e: React.KeyboardEvent<
//     HTMLInputElement | HTMLSelectElement
//   >,
//   index: number
// ) => {
//   if (e.key === "Enter") {
//     e.preventDefault();

//     const next = refs.current[index + 1];
//     if (next) {
//       next.focus();
//     }
//   }
// };

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  index: number
) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const next = inputRefs.current[index + 1];
    next?.focus();
  }
};



  /* ---------------- UI ---------------- */


const isCOD = form.subProductCode === "C";
const isDOD = form.subProductCode === "D";
const isFODDOD = form.subProductCode === "B";

const needsCollectable = isCOD || isDOD || isFODDOD;
const needsChequeDetails = isDOD || isFODDOD;

return (
  <form
  className="max-w-7xl mx-auto p-6 text-sm"
  onSubmit={(e) => {
    e.preventDefault();
    generateWaybill();
  }}
>

    <h1 className="text-2xl font-bold text-center mb-6">
      Book A Shipment
    </h1>

    <a
  href="/bulk-waybill"
  className="text-blue-600 underline text-sm"
>
  → Switch to Bulk Waybill Generator
</a>

<a
  href="/cancel-waybill"
  className="text-blue-600 underline text-sm m-10"
>
  → Go to cancel waybills
</a>


    {/* ================= SHIPPER ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Shipper</legend>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <input
  ref={(el) => {inputRefs.current[0] = el;}}
  onKeyDown={e => handleKeyDown(e, 0)}
  name="customerCode"
  placeholder="Customer Code"
  value={form.customerCode}
  onChange={handleChange}
/>
        <input
  ref={(el) => {
    inputRefs.current[1] = el;
  }}
  onKeyDown={(e) => handleKeyDown(e, 1)}
  name="shipperName"
  value={form.shipperName}
  onChange={handleChange}
/>
        <input
         ref={(el) => {
    inputRefs.current[2] = el;
  }}
  onKeyDown={(e) => handleKeyDown(e, 2)}
        name="sender" placeholder="Sender Name" value={form.sender} onChange={handleChange} />
      </div>

      <fieldset className="border p-3">
        <legend className="px-2">Pickup Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input name="shipperAddress1" value={form.shipperAddress1} placeholder="Address1" onChange={handleChange} />
          <input name="shipperAddress2" placeholder="Address2" value={form.shipperAddress2} onChange={handleChange} />
          <input name="shipperAddress3" placeholder="Address3" value={form.shipperAddress3} onChange={handleChange} />
          <input name="shipperPincode" placeholder="Pincode" value={form.shipperPincode} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input name="shipperTelephone" placeholder="Telephone No" value={form.shipperTelephone} onChange={handleChange} />
          <input name="shipperMobile" placeholder="Mobile No" value={form.shipperMobile} onChange={handleChange} />
        </div>
      </fieldset>
      <fieldset className="border p-3">
        <legend>Diff. Return Address?</legend>
        <div className="flex items-center gap-1">
       <label>Yes <input type="radio"  
       name="isReturnAddressDiffrent" 
       checked={isReturnAddressDiffrent===true}
       onChange={()=>setIsReturnAddressDiffrent(true)}
       /></label>
       <label>No <input type="radio" 
       name="isReturnAddressDiffrent"
      checked={isReturnAddressDiffrent===false}
      onChange={()=>setIsReturnAddressDiffrent(false)} />
      </label>
       </div>
       {isReturnAddressDiffrent && (
        <fieldset className="border p-3">
        <legend className="px-2">Return Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input name="returnAddress1" placeholder="Address1" onChange={handleChange} />
          <input name="returnAddress2" placeholder="Address2" onChange={handleChange} />
          <input name="returnAddress3" placeholder="Address3" onChange={handleChange} />
          <input name="returnPincode" placeholder="Pincode"   onChange={handleChange} />

        </div>

        <div className="grid grid-cols-2 gap-3">
          <input name="returnContact" placeholder="Return Contact" onChange={handleChange} />
          <input name="returnMobile" placeholder="Return Mobile" onChange={handleChange} />
          </div>
      </fieldset>
       )}
    </fieldset>
    </fieldset>

    {/* ================= CONSIGNEE ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Consignee</legend>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <input name="consigneeName" placeholder="Consignee Name" onChange={handleChange} />
        <input name="receiver" placeholder="Receiver Name" onChange={handleChange}/>
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
          <input name="consigneeTelephone" placeholder="Telephone No" onChange={handleChange}/>
          <input name="consigneeMobile" placeholder="Mobile No" onChange={handleChange} />
        </div>
      </fieldset>
    </fieldset>

    {/* ================= SHIPMENT DETAILS ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Shipment Details</legend>

      <div className="grid grid-cols-7 gap-2 items-center">
        <input name="creditReferenceNo" placeholder="Ref No" onChange={handleChange}/>
        <input name="invoiceNumber" placeholder="Invoice No" onChange={handleChange} />
        <div className="flex items-center gap-1">
          <label className="text-xs whitespace-nowrap font-bold">InvDt : </label>
          <input name="invoiceDate" type="date" id="invDt" onChange={handleChange}/>
        </div>
        
        <input name="pieceCount" value={form.pieceCount} placeholder="No Of Box" onChange={handleChange} />
        <input name="declaredValue" placeholder="Dec. Value" onChange={handleChange} />
        <input name="weight" placeholder="Weight" onChange={handleChange} />
          <div className="flex items-center gap-1">
          <label className="text-xs whitespace-nowrap font-bold">PickupDt : </label>
          <input name="pickupDate" type="date" onChange={handleChange} />
          </div>
        

             {needsCollectable && (
          <input
            name="codAmount"
            type="number"
            min="1"
            value={form.codAmount}
            placeholder="COD Amount"
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded"
          />
        )}

        {needsChequeDetails && (
  <fieldset className="border p-3 rounded flex flex-col gap-2">
    <legend className="font-semibold px-2">
      DOD / FOD Details
    </legend>

    <div className="items-center flex items-center gap-1">
      {/* Favouring Name */}
      <input
        name="favouringName"
        placeholder="Favouring Name"
        value={form.favouringName}
        onChange={handleChange}
        required
        className="border px-2 py-1 rounded"
      />

      {/* Cheque / DD */}
      <div className="flex gap-3 items-center">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="isChequeDD"
            value="Q"
            checked={form.isChequeDD === "Q"}
            onChange={handleChange}
          />
          Cheque
        </label>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="isChequeDD"
            value="D"
            checked={form.isChequeDD === "D"}
            onChange={handleChange}
          />
          DD
        </label>
      </div>

      {/* Payable At */}
      <input
        name="payableAt"
        placeholder="Payable At"
        value={form.payableAt}
        onChange={handleChange}
        required
        className="border px-2 py-1 rounded flex items-center gap-1"
      />
    </div>
  </fieldset>
)}
      </div>
    </fieldset>

    {/* ================= ITEM DETAILS ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Item Details</legend>

      <div className="grid grid-cols-4 gap-3">
        {/* <input name="refNo" placeholder="Ref No" /> */}
        <input name="itemName" placeholder="Item Name" onChange={handleChange} />
        <input name="comodityDetails1" placeholder="comodityDetails1" onChange={handleChange} />
         <input name="comodityDetails2" placeholder="comodityDetails2" onChange={handleChange} />
        <input name="comodityDetails3" placeholder="comodityDetails3" onChange={handleChange} />
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
        <select name="subProductCode" value={form.subProductCode} onChange={handleChange}>
          <option value="">Select</option>
          <option value="P">P-PREPAID</option>
          <option value="C">C-COD</option>
          <option value="B">B-FODDOD</option>
          <option value="D">D-DOD</option>
        </select>
      </fieldset>

      

      {/* <fieldset className="border p-2">
        <legend>IsToPay</legend>
        <label className="mr-2">
          <input type="radio" name="isTopay" checked={form.isTopay===true} onChange={()=>setForm({...form,isTopay:true})} /> Yes
        </label>
        <label>
          <input type="radio" name="isTopay" checked={form.isTopay===false} onChange={()=>setForm({...form,isTopay:false})} /> No
        </label>
      </fieldset> */}

<fieldset className="border p-2">
  <legend>IsToPay</legend>

  <label className="mr-2">
    <input
      type="radio"
      name="isTopay"
      value="yes"
      checked={form.isTopay === true}
      onChange={() => setForm({ ...form, isTopay: true })}
    />
    Yes
  </label>

  <label>
    <input
      type="radio"
      name="isTopay"
      value="no"
      checked={form.isTopay === false}
      onChange={() => setForm({ ...form, isTopay: false })}
    />
    No
  </label>
</fieldset>


      <fieldset className="border p-2">
        <legend>Label Size</legend>
        <select name="labelSize"
        value={form.labelSize}
        onChange={handleChange}
        >
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
        {/* <button
          onClick={generateWaybill}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {loading ? "Generating..." : "Submit" }
        </button> */}

        <button
  type="submit"
  disabled={loading}
  className="bg-blue-600 text-white px-3 py-1 rounded"
>
  {loading ? "Generating..." : "Submit"}
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
        <div>
        <p className="text-green-700 font-semibold">
          ✅ Waybill Generated Successfully : {awb}
        </p>
        
        <a
        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybill/${awb}/pdf?size=${form.labelSize}`}
        className="text-blue-600 underline ml-3"
        >
          Click to Download
        </a>
        </div>
      )}

      {error && (
        <p className="text-red-600 font-semibold">
          ❌ {error}
        </p>
      )}
    </fieldset>
  </form>
);

}
