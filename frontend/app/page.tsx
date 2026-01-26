"use client";

import { useEffect, useState,useRef } from "react";
import { toBluedartDate } from "./lib/date";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [awb, setAwb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labelSize, setLabelSize] = useState<Record<string, string>>({});
  const [isReturnAddressDiffrent,setIsReturnAddressDiffrent]=useState(false);

  // form dimensions
  const [dimensions, setDimensions] = useState([
  { length: "", breadth: "", height: "", count: "1" }
]);



  const refs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
// Supports input, select, radio, button
const inputRefs = useRef<
  (HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null)[]
>([]);

// reset on every render
inputRefs.current = [];

const registerRef = (
  el: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null
) => {
  if (el) {
    inputRefs.current.push(el);
  }
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  const index = inputRefs.current.indexOf(
    e.target as HTMLInputElement
  );

  const next = inputRefs.current[index + 1];

  if (next) {
    next.focus();
  } else {
    generateWaybill(); // last field submits
  }
};




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
    //productCode: "",
    //subProductCode: "",
    //packType: "",
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
    productType:"",
    serviceType: "",

    


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
if (!form.serviceType) return "Select Service Type";

    //if (!form.subProductCode) return "Select Sub Product Code";

    if (Number(form.weight) <= 0) return "Weight must be greater than 0";
    if (form.productType==="1" && Number(form.declaredValue) <= 0) return "Declared value must be greater than 0";

    if (form.productType==="1" && !form.itemName) return "Item name is required";

    // ✅ COD validation
    if (subProductCode === "C") {
      if (!form.codAmount) return "COD amount is required";
      if (Number(form.codAmount) <= 0)
        return "COD amount must be greater than 0";
    }

// Dimension validation
    for (let i = 0; i < dimensions.length; i++) {
  const d = dimensions[i];

  if (!d.length || !d.breadth || !d.height) {
    return `All dimensions required for box ${i + 1}`;
  }

  if (Number(d.count) <= 0) {
    return `Box count must be greater than 0 (row ${i + 1})`;
  }
}



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

    const selectedService = SERVICE_MAP[form.serviceType];

  if (!selectedService) {
    setError("Please select a valid service type");
    return;
  }

  const { productCode, subProductCode, packType } = selectedService;

  const needsCollectable =
  ["C", "D", "B"].includes(subProductCode || "");

const needsChequeDetails =
  ["D", "B"].includes(subProductCode || "");


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
          ConsigneeAddress2: form.consigneeAddr2,
          ConsigneeAddress3: form.consigneeAddr3,
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
            subProductCode === "C" || subProductCode === "B" || subProductCode === "D" 
              ? Number(form.codAmount)
              : 0,

          Commodity: {
            CommodityDetail1: form.comodityDetails1,
            CommodityDetail2: form.comodityDetails2,
            CommodityDetail3: form.comodityDetails3,
          },

          CreditReferenceNo: form.creditReferenceNo || "CR-" + Date.now(),
          DeclaredValue: Number(form.declaredValue),

  Dimensions: dimensions.map(d => ({
  Length: Number(d.length),
  Breadth: Number(d.breadth),
  Height: Number(d.height),
  Count: Number(d.count)
})),


          IsReversePickup: false,
          ItemCount: 1,
          PDFOutputNotRequired: true,
          PackType: packType || "",
          PickupDate: toBluedartDate(form.pickupDate),
          PickupTime: form.pickupTime,
          PieceCount: form.pieceCount,
          ProductCode: productCode,
          ProductType: Number(form.productType),
          RegisterPickup: true,
          SubProductCode: subProductCode || "",
          FavouringName:form.favouringName,
          IsChequeDD:form.isChequeDD,
          PayableAt:form.payableAt,
          InvoiceDate:toBluedartDate(form.invoiceDate),
          InvoiceNumber:form.invoiceNumber,

          itemdtl: [
            {
              ItemName: form.itemName || "Documents",
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

  const data = await res.json();

  // 🔴 Handle backend-wrapped Bluedart errors
  if (!res.ok) {
    const backendError =
      data?.["error-response"]?.[0]?.Status?.[0]?.StatusInformation ||
      data?.message ||
      data?.title ||
      "Bluedart rejected the request";

    //throw new Error(backendError);
    setError(backendError);
    setLoading(false);
    return;

    
  }

  // 🔴 Handle Bluedart business errors (success HTTP but error flag)
  if (data?.GenerateWayBillResult?.IsError) {
    const bluedartError =
      data.GenerateWayBillResult?.ErrorMessage ||
      data.GenerateWayBillResult?.ErrorDescription ||
      "Bluedart rejected the request";

    throw new Error(bluedartError);

  }

  // ✅ Success
  setAwb(data.GenerateWayBillResult.AWBNo);

} catch (err: any) {
  console.error("Waybill error:", err);

  setError(
    err?.message ||
    "Bluedart rejected the request. Please check details."
  );
} finally {
  setLoading(false);
}

  };


  const addDimension = () => {
  setDimensions(prev => [
    ...prev,
    { length: "", breadth: "", height: "", count: "1" }
  ]);
};

const removeDimension = (index: number) => {
  setDimensions(prev => prev.filter((_, i) => i !== index));
};

const updateDimension = (
  index: number,
  field: "length" | "breadth" | "height" | "count",
  value: string
) => {
  setDimensions(prev =>
    prev.map((dim, i) =>
      i === index ? { ...dim, [field]: value } : dim
    )
  );
};


const SERVICE_MAP: Record<
  string,
  { productCode: string; subProductCode?: string; packType?: string }
> = {
  // Etail
  ETAIL_APEX_COD:        { productCode: "A", subProductCode: "C" },
  ETAIL_APEX_PREPAID:   { productCode: "A", subProductCode: "P" },
  ETAIL_SURFACE_COD:    { productCode: "E", subProductCode: "C" },
  ETAIL_SURFACE_PREPAID:{ productCode: "E", subProductCode: "P" },

  // Dart Plus / Bharat Dart
  DARTPLUS_COD:         { productCode: "A", subProductCode: "C", packType: "L" },
  DARTPLUS_PREPAID:    { productCode: "A", subProductCode: "P", packType: "L" },

  // B2B
  APEX_B2B:             { productCode: "A" },
  SURFACE_B2B:          { productCode: "E" },

  // Priority
  DOMESTIC_PRIORITY:   { productCode: "D" },

  // DOD / FOD
  APEX_DOD:             { productCode: "A", subProductCode: "D" },
  APEX_FOD:             { productCode: "A", subProductCode: "A" },
  SURFACE_DOD:          { productCode: "E", subProductCode: "D" },
  SURFACE_FOD:          { productCode: "E", subProductCode: "A" },

  // DODFOD
  APEX_DODFOD:          { productCode: "A", subProductCode: "B" },
  SURFACE_DODFOD:       { productCode: "E", subProductCode: "B" },
};


   

  /* ---------------- UI ---------------- */




// const isCOD = form.subProductCode === "C";
// const isDOD = form.subProductCode === "D";
// const isFODDOD = form.subProductCode === "B";
const isDuts=form.productType==="1";

// const needsCollectable = isCOD || isDOD || isFODDOD;
// const needsChequeDetails = isDOD || isFODDOD;

// const needsCollectable =
//   ["C", "D", "B"].includes(subProductCode || "");

// const needsChequeDetails =
//   ["D", "B"].includes(subProductCode || "");


const selectedService = form.serviceType
  ? SERVICE_MAP[form.serviceType]
  : null;

const subProductCode = selectedService?.subProductCode ?? "";

const needsCollectable = ["C", "D", "B"].includes(subProductCode);
const needsChequeDetails = ["D", "B"].includes(subProductCode);



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
        <input ref={registerRef} onKeyDown={handleKeyDown}
  name="customerCode"
  value={form.customerCode}
  onChange={handleChange}
  placeholder="Customer Code"
/>

<input ref={registerRef} onKeyDown={handleKeyDown}
  name="shipperName"
  value={form.shipperName}
  onChange={handleChange}
  placeholder="Shipper Name"
/>

<input ref={registerRef} onKeyDown={handleKeyDown}
  name="sender"
  value={form.sender}
  onChange={handleChange}
  placeholder="Sender Name"
/>
      </div>

      <fieldset className="border p-3">
        <legend className="px-2">Pickup Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input ref={registerRef} onKeyDown={handleKeyDown}
  name="shipperAddress1"
  value={form.shipperAddress1}
  onChange={handleChange}
  placeholder="Address1"
/>

<input ref={registerRef} onKeyDown={handleKeyDown}
  name="shipperAddress2"
  value={form.shipperAddress2}
  onChange={handleChange}
  placeholder="Address2"
/>

<input ref={registerRef} onKeyDown={handleKeyDown}
  name="shipperAddress3"
  value={form.shipperAddress3}
  onChange={handleChange}
  placeholder="Address3"
/>

<input ref={registerRef} onKeyDown={handleKeyDown}
  name="shipperPincode"
  value={form.shipperPincode}
  onChange={handleChange}
  placeholder="Pincode"
/>

        </div>
      </fieldset>


      <fieldset className="border p-3">
        <legend>Diff. Return Address?</legend>
        <div className="flex items-center gap-1">
       <label>Yes <input        
       ref={registerRef}
  onKeyDown={handleKeyDown} type="radio"  
       name="isReturnAddressDiffrent" 
       checked={isReturnAddressDiffrent===true}
       onChange={()=>setIsReturnAddressDiffrent(true)}
       /> </label>
       
       <label>No <input 
              ref={registerRef}
            onKeyDown={handleKeyDown}
       type="radio" 
       name="isReturnAddressDiffrent"
      checked={isReturnAddressDiffrent===false}
      onChange={()=>setIsReturnAddressDiffrent(false)} />
      </label>
       </div>
       {isReturnAddressDiffrent && (
        <fieldset className="border p-3">
        <legend className="px-2">Return Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input 
                 ref={registerRef}
  onKeyDown={handleKeyDown}
          name="returnAddress1" placeholder="Address1" onChange={handleChange} />

          <input 
                 ref={registerRef}
  onKeyDown={handleKeyDown}
          name="returnAddress2" placeholder="Address2" onChange={handleChange} />

          <input 
                 ref={registerRef}
  onKeyDown={handleKeyDown}
          name="returnAddress3" placeholder="Address3" onChange={handleChange} />

          <input 
                 ref={registerRef}
  onKeyDown={handleKeyDown}
          name="returnPincode" placeholder="Pincode"   onChange={handleChange} />

        </div>

        <div className="grid grid-cols-2 gap-3">
          <input 
                 ref={registerRef}
  onKeyDown={handleKeyDown}
          name="returnContact" placeholder="Return Contact" onChange={handleChange} />

          <input 
                 ref={registerRef}
  onKeyDown={handleKeyDown}
          name="returnMobile" placeholder="Return Mobile" onChange={handleChange} />
          </div>
      </fieldset>
       )}
    </fieldset>
    </fieldset>

    {/* ================= CONSIGNEE ================= */}
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Consignee</legend>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <input 
               ref={registerRef}
  onKeyDown={handleKeyDown}
        name="consigneeName" placeholder="Consignee Name" onChange={handleChange} />
        <input 
                           ref={registerRef}
  onKeyDown={handleKeyDown}
        name="receiver" placeholder="Receiver Name" onChange={handleChange}/>
      </div>

      <fieldset className="border p-3">
        <legend className="px-2">Delivery Address</legend>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <input
                      ref={registerRef}
  onKeyDown={handleKeyDown}
          name="consigneeAddr1" placeholder="Address1" onChange={handleChange} />
          <input 
                      ref={registerRef}
  onKeyDown={handleKeyDown}
          name="consigneeAddr2" placeholder="Address2" onChange={handleChange} />


          <input 
                      ref={registerRef}
  onKeyDown={handleKeyDown}
          name="consigneeAddr3" placeholder="Address3" onChange={handleChange} />

          <input
                      ref={registerRef}
  onKeyDown={handleKeyDown}
          name="consigneePincode" placeholder="Pincode" onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input 
                      ref={registerRef}
  onKeyDown={handleKeyDown}
          name="consigneeTelephone" placeholder="Telephone No" onChange={handleChange}/>
          <input
                      ref={registerRef}
  onKeyDown={handleKeyDown}
          name="consigneeMobile" placeholder="Mobile No" onChange={handleChange} />
        </div>
      </fieldset>
    </fieldset>

    {/* ================= SHIPMENT DETAILS ================= */}
    
    <fieldset className="border p-4 mb-4">
  <legend className="font-semibold px-2">Shipment Details</legend>

  {/* ---------- MAIN ROW ---------- */}
  <div className="grid grid-cols-7 gap-2 items-center">

    <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
      name="creditReferenceNo"
      placeholder="Ref No"
      className="border h-8 px-2 text-sm rounded"
      onChange={handleChange}
    />

    <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
      name="pieceCount"
      placeholder="No Of Box"
      className="border h-8 px-2 text-sm rounded"
      onChange={handleChange}
    />

    {isDuts && (
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="declaredValue"
        placeholder="Dec. Value"
        className="border h-8 px-2 text-sm rounded"
        onChange={handleChange}
      />
    )}

    {isDuts && (
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="invoiceNumber"
        placeholder="Invoice No"
        className="border h-8 px-2 text-sm rounded"
        onChange={handleChange}
      />
    )}

    {/* Invoice Date */}
    {isDuts && (
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold">InvDt</span>
        <input
          ref={registerRef}
          onKeyDown={handleKeyDown}
          type="date"
          name="invoiceDate"
          className="border h-8 px-1 text-xs rounded w-[135px]"
          onChange={handleChange}
        />
      </div>
    )}

    <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
      name="weight"
      placeholder="Weight"
      className="border h-8 px-2 text-sm rounded"
      onChange={handleChange}
    />

    {/* Pickup Date */}
    <div className="flex items-center gap-1">
      <span className="text-xs font-semibold">PickupDt</span>
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        type="date"
        name="pickupDate"
        className="border h-8 px-1 text-xs rounded w-[135px]"
        onChange={handleChange}
      />
    </div>

    {/* COD */}
    {needsCollectable && (
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="codAmount"
        type="number"
        placeholder="COD Amount"
        className="border h-8 px-2 text-sm rounded col-span-2"
        onChange={handleChange}
      />
    )}
  </div>

  {/* ---------- DOD / FOD ROW ---------- */}
  {needsChequeDetails && (
    <fieldset className="border mt-3 p-3 rounded">
      <legend className="font-semibold px-2">DOD / FOD Details</legend>

      <div className="grid grid-cols-3 gap-3 items-center">
        <input
          ref={registerRef}
          onKeyDown={handleKeyDown}
          name="favouringName"
          placeholder="Favouring Name"
          className="border h-8 px-2 text-sm rounded"
          onChange={handleChange}
        />

        <div className="flex gap-4 items-center text-sm">
          <label className="flex gap-1 items-center">
            <input
              type="radio"
              name="isChequeDD"
              value="Q"
              checked={form.isChequeDD === "Q"}
              onChange={handleChange}
            />
            Cheque
          </label>

          <label className="flex gap-1 items-center">
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

        <input
          ref={registerRef}
          onKeyDown={handleKeyDown}
          name="payableAt"
          placeholder="Payable At"
          className="border h-8 px-2 text-sm rounded"
          onChange={handleChange}
        />
      </div>
    </fieldset>
  )}
</fieldset>


{/* ================= DIMENSIONS ================= */}
<fieldset className="border p-4 mb-4">
  <legend className="font-semibold px-2">Package Dimensions</legend>

  {dimensions.map((dim, index) => (
    <div
      key={index}
      className="grid grid-cols-5 gap-3 mb-2 items-center"
    >
      <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
        type="number"
        placeholder="Length (cm)"
        value={dim.length}
        onChange={(e) =>
          updateDimension(index, "length", e.target.value)
        }
        className="border px-2 py-1 rounded"
      />

      <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
        type="number"
        placeholder="Breadth (cm)"
        value={dim.breadth}
        onChange={(e) =>
          updateDimension(index, "breadth", e.target.value)
        }
        className="border px-2 py-1 rounded"
      />

      <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
        type="number"
        placeholder="Height (cm)"
        value={dim.height}
        onChange={(e) =>
          updateDimension(index, "height", e.target.value)
        }
        className="border px-2 py-1 rounded"
      />

      <input
      ref={registerRef}
      onKeyDown={handleKeyDown}
        type="number"
        placeholder="Boxes"
        value={dim.count}
        min={1}
        onChange={(e) =>
          updateDimension(index, "count", e.target.value)
        }
        className="border px-2 py-1 rounded"
      />

      {/* Remove row */}
      {dimensions.length > 1 && (
        <button
          type="button"
          onClick={() => removeDimension(index)}
          className="text-red-600 text-sm"
        >
          ✕
        </button>
      )}
    </div>
  ))}

  <button
  ref={registerRef}
  onKeyDown={handleKeyDown}
    type="button"
    onClick={addDimension}
    className="mt-2 text-blue-600 underline text-sm"
  >
    + Add Another Box
  </button>
</fieldset>



    {/* ================= ITEM DETAILS ================= */}
    {isDuts &&
    <fieldset className="border p-4 mb-4">
      <legend className="font-semibold px-2">Item Details</legend>
       
      <div className="grid grid-cols-4 gap-3">
        {/* <input name="refNo" placeholder="Ref No" /> */}
        <input 
                    ref={registerRef}
  onKeyDown={handleKeyDown}
        name="itemName" placeholder="Item Name" onChange={handleChange} />

        <input
                    ref={registerRef}
  onKeyDown={handleKeyDown}
        name="comodityDetails1" placeholder="comodityDetails1" onChange={handleChange} />
         <input 
                     ref={registerRef}
  onKeyDown={handleKeyDown}
         name="comodityDetails2" placeholder="comodityDetails2" onChange={handleChange} />
        <input 
                    ref={registerRef}
  onKeyDown={handleKeyDown}
        name="comodityDetails3" placeholder="comodityDetails3" onChange={handleChange} />
      </div>

    </fieldset>
    }

    {/* ================= OPTIONS ROW ================= */}
    <div className="grid grid-cols-6 gap-3 mb-4">

      <fieldset className="border p-2">
  <legend>Service Type</legend>

  <select
    name="serviceType"
    value={form.serviceType}
    onChange={handleChange}
    className="border px-2 py-1 rounded w-full"
  >
    <option value="">Select Service</option>

    <optgroup label="Etail">
      <option value="ETAIL_APEX_COD">Etail Apex COD</option>
      <option value="ETAIL_APEX_PREPAID">Etail Apex Prepaid</option>
      <option value="ETAIL_SURFACE_COD">Etail Surface COD</option>
      <option value="ETAIL_SURFACE_PREPAID">Etail Surface Prepaid</option>
    </optgroup>

    <optgroup label="Dart Plus / Bharat Dart">
      <option value="DARTPLUS_COD">Dart Plus COD</option>
      <option value="DARTPLUS_PREPAID">Dart Plus Prepaid</option>
    </optgroup>

    <optgroup label="B2B">
      <option value="APEX_B2B">Apex B2B</option>
      <option value="SURFACE_B2B">Surface B2B</option>
    </optgroup>

    <optgroup label="Priority">
      <option value="DOMESTIC_PRIORITY">Domestic Priority</option>
    </optgroup>

    <optgroup label="DOD / FOD">
      <option value="APEX_DOD">Apex DOD</option>
      <option value="APEX_FOD">Apex FOD</option>
      <option value="SURFACE_DOD">Surface DOD</option>
      <option value="SURFACE_FOD">Surface FOD</option>
    </optgroup>

    <optgroup label="DODFOD">
      <option value="APEX_DODFOD">Apex DODFOD</option>
      <option value="SURFACE_DODFOD">Surface DODFOD</option>
    </optgroup>
  </select>
</fieldset>


<fieldset className="border p-2">
  <legend>IsToPay</legend>

  <label className="mr-2">
    <input
                       ref={registerRef}
  onKeyDown={handleKeyDown}
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

                       ref={registerRef}
  onKeyDown={handleKeyDown}
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
        <select 
                           ref={registerRef}
  onKeyDown={handleKeyDown}
        name="labelSize"
        value={form.labelSize}
        onChange={handleChange}
        >
          <option value="A4">A4</option>
          <option value="LABEL_4X6">4x6</option>
        </select>
      </fieldset>

      <fieldset className="border p-2">
        <legend>ShipmentType</legend>
        <select 
                           ref={registerRef}
  onKeyDown={handleKeyDown}
        name="productType" onChange={handleChange}>
          <option value="">Select</option>
          <option value="0">DOX</option>
          <option value="1">NDOX</option>
        </select>
      </fieldset>

      <fieldset className="border p-2 flex gap-2 items-center">
        <legend>Action</legend>
        <button
                    ref={registerRef}
  type="submit"
  disabled={loading}
  className="bg-blue-600 text-white px-3 py-1 rounded"
>
  {loading ? "Generating..." : "Submit"}
</button>

        <button 
        className="bg-gray-400 text-white px-3 py-1 rounded">
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