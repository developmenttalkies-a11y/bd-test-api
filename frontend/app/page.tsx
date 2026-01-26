"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { toBluedartDate } from "./lib/date";

/* ================= SERVICE MAP ================= */

const SERVICE_MAP: Record<
  string,
  { productCode: string; subProductCode?: string; packType?: string }
> = {
  ETAIL_APEX_COD: { productCode: "A", subProductCode: "C" },
  ETAIL_APEX_PREPAID: { productCode: "A", subProductCode: "P" },
  ETAIL_SURFACE_COD: { productCode: "E", subProductCode: "C" },
  ETAIL_SURFACE_PREPAID: { productCode: "E", subProductCode: "P" },

  DARTPLUS_COD: { productCode: "A", subProductCode: "C", packType: "L" },
  DARTPLUS_PREPAID: { productCode: "A", subProductCode: "P", packType: "L" },

  APEX_B2B: { productCode: "A" },
  SURFACE_B2B: { productCode: "E" },

  DOMESTIC_PRIORITY: { productCode: "D" },

  APEX_DOD: { productCode: "A", subProductCode: "D" },
  APEX_FOD: { productCode: "A", subProductCode: "A" },
  SURFACE_DOD: { productCode: "E", subProductCode: "D" },
  SURFACE_FOD: { productCode: "E", subProductCode: "A" },

  APEX_DODFOD: { productCode: "A", subProductCode: "B" },
  SURFACE_DODFOD: { productCode: "E", subProductCode: "B" },
};

/* ================= COMPONENT ================= */

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [awb, setAwb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReturnAddressDiffrent, setIsReturnAddressDiffrent] = useState(false);

  /* ---------- FORM STATE ---------- */

  const [form, setForm] = useState({
    customerCode: "940111",
    originArea: "GGN",
    shipperName: "XYZ Company.com",
    shipperAddress1: "123, 2nd Floor, Sai Residency",
    shipperAddress2: "4th Cross, 5th Main, Koramangala 4th Block",
    shipperAddress3: "Gurgaon, Haryana",
    shipperPincode: "122001",
    shipperMobile: "9999885544",
    shipperTelephone: "",
    sender: "",

    returnAddress1: "",
    returnAddress2: "",
    returnAddress3: "",
    returnContact: "",
    returnMobile: "",
    returnPincode: "",

    consigneeName: "",
    consigneeMobile: "",
    consigneePincode: "",
    consigneeAddr1: "",
    consigneeAddr2: "",
    consigneeAddr3: "",
    consigneeTelephone: "",
    receiver: "",

    serviceType: "",
    productType: "",
    weight: "",
    pieceCount: "",
    declaredValue: "",
    invoiceNumber: "",
    invoiceDate: "",
    pickupDate: "",
    pickupTime: "1600",
    creditReferenceNo:"",

    codAmount: "",
    favouringName: "",
    isChequeDD: "",
    payableAt: "",

    itemName: "",
    itemQty: "",
    itemValue: "",
    comodityDetails1: "",
    comodityDetails2: "",
    comodityDetails3: "",

    labelSize: "A4",
    isTopay: false,
  });

  /* ---------- DIMENSIONS ---------- */

  const [dimensions, setDimensions] = useState([
    { length: "", breadth: "", height: "", count: "1" },
  ]);

  /* ---------- DERIVED SERVICE ---------- */

  const selectedService = useMemo(
    () => SERVICE_MAP[form.serviceType],
    [form.serviceType]
  );

  const subProductCode = selectedService?.subProductCode || "";

  const needsCollectable = ["C", "D", "B"].includes(subProductCode);
  const needsChequeDetails = ["D", "B"].includes(subProductCode);
  const isDuts = form.productType === "1";

  /* ---------- KEYBOARD NAVIGATION ---------- */

  const inputRefs = useRef<
    (HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null)[]
  >([]);

  const registerRef = (
    el: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null
  ) => {
    if (el && !inputRefs.current.includes(el)) {
      inputRefs.current.push(el);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const idx = inputRefs.current.indexOf(e.target as any);
    const next = inputRefs.current[idx + 1];
    next ? next.focus() : generateWaybill();
  };

  /* ---------- HANDLERS ---------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ---------------- DIMENSIONS HELPERS ---------------- */

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


  /* ---------- VALIDATION ---------- */

  const validateForm = () => {
    const e: Record<string, string> = {};

    if (!form.consigneeName) e.consigneeName = "Required";
    if (!form.consigneeMobile) e.consigneeMobile = "Required";
    if (!form.consigneePincode) e.consigneePincode = "Required";
    if (!form.consigneeAddr1) e.consigneeAddr1 = "Required";
    if (!form.serviceType) e.serviceType = "Required";
    if (!form.weight) e.weight = "Required";
    if (!form.productType) e.productType = "Required";
   
    if (isDuts && !form.itemName) e.itemName = "Required";
    if (isDuts && !form.declaredValue) e.declaredValue = "Required";
    if (isDuts && !form.invoiceNumber) e.invoiceNumber = "Required";

    if (needsCollectable && !form.codAmount) e.codAmount = "Required";

    if (needsChequeDetails) {
      if (!form.favouringName) e.favouringName = "Required";
      if (!form.isChequeDD) e.isChequeDD = "Required";
      if (!form.payableAt) e.payableAt = "Required";
    }

 dimensions.forEach((d, i) => {
  if (!d.length) e[`length_${i}`] = "Required";
  if (!d.breadth) e[`breadth_${i}`] = "Required";
  if (!d.height) e[`height_${i}`] = "Required";
});


    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const focusFirstError = () => {
    const key = Object.keys(errors)[0];
    const el = document.querySelector(`[name="${key}"]`) as HTMLElement;
    el?.focus();
  };

  const fieldClass = (name: string) =>
    `border h-8 px-2 rounded ${
      errors[name] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  /* ---------- API ---------- */

  const generateWaybill = async () => {
  setErrors({});
  setError(null);
  setAwb(null);

  // 1️⃣ Validate form
  if (!validateForm()) {
    setTimeout(focusFirstError, 0);
    return;
  }

  // 2️⃣ Resolve service
  const selectedService = SERVICE_MAP[form.serviceType];
  if (!selectedService) {
    setError("Please select a valid service");
    return;
  }

  const { productCode, subProductCode, packType } = selectedService;

  setLoading(true);

  try {
    // 3️⃣ Return address logic
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

    // 4️⃣ Build payload
    const payload = {
      Request: {
        Consignee: {
          ConsigneeName: form.consigneeName,
          ConsigneeAttention: form.consigneeName,
          ConsigneeMobile: form.consigneeMobile,
          ConsigneeTelephone: form.consigneeTelephone,
          ConsigneeAddress1: form.consigneeAddr1,
          ConsigneeAddress2: form.consigneeAddr2,
          ConsigneeAddress3: form.consigneeAddr3,
          ConsigneePincode: form.consigneePincode,
        },

        Returnadds,

        Services: {
          ProductCode: productCode,
          SubProductCode: subProductCode || "",
          PackType: packType || "",
          ProductType: Number(form.productType),

          PieceCount: Number(form.pieceCount),
          ActualWeight: Number(form.weight),
          DeclaredValue: Number(form.declaredValue || 0),

          CollectableAmount:
            ["C", "D", "B"].includes(subProductCode || "")
              ? Number(form.codAmount)
              : 0,

          PickupDate: toBluedartDate(form.pickupDate),
          PickupTime: form.pickupTime,

          CreditReferenceNo:
            form.creditReferenceNo || "CR-" + Date.now(),

          InvoiceNumber: form.invoiceNumber,
          InvoiceDate: toBluedartDate(form.invoiceDate),

          FavouringName: form.favouringName,
          IsChequeDD: form.isChequeDD,
          PayableAt: form.payableAt,

          Dimensions: dimensions.map(d => ({
            Length: Number(d.length),
            Breadth: Number(d.breadth),
            Height: Number(d.height),
            Count: Number(d.count),
          })),

          Commodity: {
            CommodityDetail1: form.comodityDetails1,
            CommodityDetail2: form.comodityDetails2,
            CommodityDetail3: form.comodityDetails3,
          },

          itemdtl: [
            {
              ItemName: form.itemName || "Documents",
              Itemquantity: Number(form.itemQty || 1),
              ItemValue: Number(form.itemValue || 0),
              TotalValue: Number(form.itemValue || 0),
            },
          ],

          RegisterPickup: true,
          PDFOutputNotRequired: true,
        },

        Shipper: {
          CustomerCode: form.customerCode,
          CustomerName: form.shipperName,
          Sender: form.sender,
          OriginArea: form.originArea,
          CustomerMobile: form.shipperMobile,
          CustomerTelephone: form.shipperTelephone,
          CustomerAddress1: form.shipperAddress1,
          CustomerAddress2: form.shipperAddress2,
          CustomerAddress3: form.shipperAddress3,
          CustomerPincode: form.shipperPincode,
          IsToPayCustomer: form.isTopay,
        },
      },

      Profile: {
        LoginID: "GG940111",
        LicenceKey: "kh7mnhqkmgegoksipxr0urmqesesseup",
        Api_type: "S",
      },
    };

    // 5️⃣ Call backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybill`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    // 6️⃣ Backend / Bluedart errors
    if (!res.ok) {
      const backendError =
        data?.details ||
        data?.message ||
        "Bluedart rejected the request";
      throw new Error(backendError);
    }

    if (data?.GenerateWayBillResult?.IsError) {
      throw new Error(
        data.GenerateWayBillResult?.ErrorMessage ||
          "Bluedart rejected the request"
      );
    }

    // 7️⃣ Success
    setAwb(data.GenerateWayBillResult.AWBNo);
  } catch (err: any) {
    console.error("Waybill error:", err);
    setError(err.message || "Bluedart rejected request");
  } finally {
    setLoading(false);
  }
};

  /* ---------- UI ---------- */

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

  {/* ================= SHIPPER ================= */}
  <fieldset className="border p-4 mb-4">
    <legend className="font-semibold px-2">Shipper</legend>

    <div className="grid grid-cols-3 gap-3 mb-3">
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="originArea"
        value={form.originArea}
        onChange={handleChange}
        placeholder="OriginArea"
        className={fieldClass("customerCode")}
        max="3"
      />
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="customerCode"
        value={form.customerCode}
        onChange={handleChange}
        placeholder="Customer Code"
        className={fieldClass("customerCode")}
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="shipperName"
        value={form.shipperName}
        onChange={handleChange}
        placeholder="Shipper Name"
        className={fieldClass("shipperName")}
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="sender"
        value={form.sender}
        onChange={handleChange}
        placeholder="Sender Name"
        className="border h-8 px-2 rounded"
      />
    </div>

    <fieldset className="border p-3">
      <legend className="px-2">Pickup Address</legend>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="shipperAddress1"
          value={form.shipperAddress1}
          onChange={handleChange}
          placeholder="Address 1"
          className="border h-8 px-2 rounded"
        />
        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="shipperAddress2"
          value={form.shipperAddress2}
          onChange={handleChange}
          placeholder="Address 2"
          className="border h-8 px-2 rounded"
        />
        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="shipperAddress3"
          value={form.shipperAddress3}
          onChange={handleChange}
          placeholder="Address 3"
          className="border h-8 px-2 rounded"
        />
        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="shipperPincode"
          value={form.shipperPincode}
          onChange={handleChange}
          placeholder="Pincode"
          className="border h-8 px-2 rounded"
        />

        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="shipperMobile"
          value={form.shipperMobile}
          onChange={handleChange}
          placeholder="Mobile"
          className="border h-8 px-2 rounded"
        />
      </div>
    </fieldset>

    <fieldset className="border p-3 mt-3">
      <legend>Different Return Address?</legend>
      <label className="mr-4">
        <input
          ref={registerRef}
          onKeyDown={handleKeyDown}
          type="radio"
          checked={isReturnAddressDiffrent}
          onChange={() => setIsReturnAddressDiffrent(true)}
        />{" "}
        Yes
      </label>
      <label>
        <input
          ref={registerRef}
          onKeyDown={handleKeyDown}
          type="radio"
          checked={!isReturnAddressDiffrent}
          onChange={() => setIsReturnAddressDiffrent(false)}
        />{" "}
        No
      </label>

      {isReturnAddressDiffrent && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          <input ref={registerRef} 
          onKeyDown={handleKeyDown} 
          name="returnContact" 
          placeholder="Return Contact" 
          onChange={handleChange} 
          className="border h-8 px-2 rounded"/> 
          
          <input ref={registerRef} 
          onKeyDown={handleKeyDown} 
          name="returnMobile" 
          placeholder="Return Mobile" 
          onChange={handleChange} 
          className="border h-8 px-2 rounded"/> 
          
          <input ref={registerRef} onKeyDown={handleKeyDown}
            name="returnAddress1"
            placeholder="Return Address 1"
            onChange={handleChange}
            className="border h-8 px-2 rounded"
          />
          <input ref={registerRef} onKeyDown={handleKeyDown}
            name="returnAddress2"
            placeholder="Return Address 2"
            onChange={handleChange}
            className="border h-8 px-2 rounded"
          />
          <input ref={registerRef} onKeyDown={handleKeyDown}
            name="returnAddress3"
            placeholder="Return Address 3"
            onChange={handleChange}
            className="border h-8 px-2 rounded"
          />
          <input ref={registerRef} onKeyDown={handleKeyDown}
            name="returnPincode"
            placeholder="Return Pincode"
            onChange={handleChange}
            className="border h-8 px-2 rounded"
          />
        </div>
      )}
    </fieldset>
  </fieldset>

  {/* ================= CONSIGNEE ================= */}
  <fieldset className="border p-4 mb-4">
    <legend className="font-semibold px-2">Consignee</legend>

    <div className="grid grid-cols-2 gap-3 mb-3">
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="consigneeName"
        placeholder="Consignee Name"
        onChange={handleChange}
        className={fieldClass("consigneeName")}
      />
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="receiver"
        placeholder="Receiver Name"
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />
    </div>

    <div className="grid grid-cols-4 gap-3">
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="consigneeAddr1"
        placeholder="Address 1"
        onChange={handleChange}
        className={fieldClass("consigneeAddr1")}
      />
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="consigneeAddr2"
        placeholder="Address 2"
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="consigneeAddr3"
        placeholder="Address 3"
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="consigneePincode"
        placeholder="Pincode"
        onChange={handleChange}
        className={fieldClass("consigneePincode")}
      />

      <input
  ref={registerRef}
  onKeyDown={handleKeyDown}
  name="consigneeMobile"
  placeholder="Consignee Mobile"
  onChange={handleChange}
  className={fieldClass("consigneeMobile")}
/>


    </div>
  </fieldset>

  {/* ================= SERVICE / PRODUCT ================= */}
<fieldset className="border p-4 mb-4">
  <legend className="font-semibold px-2">Service & Product</legend>

  <div className="grid grid-cols-3 gap-4">

    {/* Service Type */}
    <div>
      <label className="text-xs font-semibold">Service Type *</label>
      <select
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="serviceType"
        value={form.serviceType}
        onChange={handleChange}
        className={fieldClass("serviceType")}
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

      {errors.serviceType && (
        <p className="text-xs text-red-600 mt-1">
          Service Type is required
        </p>
      )}
    </div>

    {/* Shipment Type */}
    <div>
      <label className="text-xs font-semibold">Shipment Type *</label>
      <select
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="productType"
        value={form.productType}
        onChange={handleChange}
        className={fieldClass("productType")}
      >
        <option value="">Select</option>
        <option value="0">DOX</option>
        <option value="1">NDOX</option>
      </select>
    </div>

    {/* Label Size */}
    <div className="relative">
      <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-semibold">Label Size</label>
      <select
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="labelSize"
        value={form.labelSize}
        onChange={handleChange}
        className="border h-8 px-2 rounded w-full"
      >
        <option value="A4">A4</option>
        <option value="LABEL_4X6">4 x 6</option>
      </select>
    </div>

  </div>
</fieldset>


  {/* ================= SHIPMENT DETAILS ================= */}
  <fieldset className="border p-4 mb-4">
    <legend className="font-semibold px-2">Shipment Details</legend>

    <div className="grid grid-cols-7 gap-2 items-center">
      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="creditReferenceNo"
        placeholder="Ref No"
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />

      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="pieceCount"
        placeholder="No of Boxes"
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />

      {isDuts && (
        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="declaredValue"
          placeholder="Declared Value"
          onChange={handleChange}
          className={fieldClass("declaredValue")}
        />
      )}

      {isDuts && (
        <input ref={registerRef} onKeyDown={handleKeyDown}
          name="invoiceNumber"
          placeholder="Invoice No"
          onChange={handleChange}
          className={fieldClass("invoiceNumber")}
        />
      )}

          {/* Invoice Date */}
    {isDuts && (
      <>
<div className="relative">
  <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-semibold">
    Invoice Date
  </label>
  <input
    type="date"
    name="invoiceDate"
    ref={registerRef}
    onKeyDown={handleKeyDown}
    onChange={handleChange}
    className="border h-8 px-2 text-sm rounded w-full"
  />
</div>

<div className="relative">
  <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-semibold">
    Pickup Date
  </label>
  <input
    type="date"
    name="pickupDate"
    ref={registerRef}
    onKeyDown={handleKeyDown}
    onChange={handleChange}
    className="border h-8 px-2 text-sm rounded w-full"
  />
</div>

</>
    )}

      <input ref={registerRef} onKeyDown={handleKeyDown}
        name="weight"
        placeholder="Weight"
        onChange={handleChange}
        className={fieldClass("weight")}
      />
    
    </div>

    {needsCollectable && (
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="codAmount"
        placeholder="COD Amount"
        onChange={handleChange}
        className={fieldClass("codAmount")}
      />
    )}

    {needsChequeDetails && (
      <fieldset className="border mt-3 p-3 rounded">
        <legend className="font-semibold px-2">DOD / FOD Details</legend>

        <div className="grid grid-cols-3 gap-3">
          <input ref={registerRef} onKeyDown={handleKeyDown}
            name="favouringName"
            placeholder="Favouring Name"
            onChange={handleChange}
            className={fieldClass("favouringName")}
          />

          <div className="flex gap-4 items-center">
            <label>
              <input
                type="radio"
                name="isChequeDD"
                value="Q"
                checked={form.isChequeDD === "Q"}
                onChange={handleChange}
              />{" "}
              Cheque
            </label>
            <label>
              <input
                type="radio"
                name="isChequeDD"
                value="D"
                checked={form.isChequeDD === "D"}
                onChange={handleChange}
              />{" "}
              DD
            </label>
          </div>

          <input ref={registerRef} onKeyDown={handleKeyDown}
            name="payableAt"
            placeholder="Payable At"
            onChange={handleChange}
            className={fieldClass("payableAt")}
          />
        </div>
      </fieldset>
    )}
  </fieldset>

  {/* ================= ITEM DETAILS ================= */}
{isDuts && (
  <fieldset className="border p-4 mb-4">
    <legend className="font-semibold px-2">Item Details</legend>

    <div className="grid grid-cols-4 gap-3">

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="itemName"
        placeholder="Item Name"
        value={form.itemName}
        onChange={handleChange}
        className={fieldClass("itemName")}
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="itemQty"
        type="number"
        min={1}
        placeholder="Qty"
        value={form.itemQty}
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="itemValue"
        type="number"
        min={1}
        placeholder="Item Value"
        value={form.itemValue}
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="comodityDetails1"
        placeholder="Commodity Details"
        value={form.comodityDetails1}
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />
    </div>

    <div className="grid grid-cols-2 gap-3 mt-3">
      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="comodityDetails2"
        placeholder="Commodity Details 2"
        value={form.comodityDetails2}
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        name="comodityDetails3"
        placeholder="Commodity Details 3"
        value={form.comodityDetails3}
        onChange={handleChange}
        className="border h-8 px-2 rounded"
      />
    </div>

    {errors.itemName && (
      <p className="text-xs text-red-600 mt-1">
        Item Name is required for NDOX shipments
      </p>
    )}
  </fieldset>
)}


  {/* ================= PACKAGE DIMENSIONS ================= */}
<fieldset className="border p-4 mb-4">
  <legend className="font-semibold px-2">Package Dimensions</legend>

  {dimensions.map((dim, index) => (
    <div
      key={index}
      className="grid grid-cols-5 gap-3 mb-2 items-center"
    >
      <input
        ref={registerRef}
        name={`length_${index}`}
        onKeyDown={handleKeyDown}
        type="number"
        placeholder="Length (cm)"
        value={dim.length}
        onChange={(e) =>
          updateDimension(index, "length", e.target.value)
        }
        className={`border h-8 px-2 rounded ${
          errors[`dimension_${index}`] ? "border-red-500 bg-red-50" : ""
        }`}
      />

      <input
        ref={registerRef}
        name={`breadth_${index}`}
        onKeyDown={handleKeyDown}
        type="number"
        placeholder="Breadth (cm)"
        value={dim.breadth}
        onChange={(e) =>
          updateDimension(index, "breadth", e.target.value)
        }
        className={`border h-8 px-2 rounded ${
          errors[`dimension_${index}`] ? "border-red-500 bg-red-50" : ""
        }`}
      />

      <input
        ref={registerRef}
        name={`height_${index}`}
        onKeyDown={handleKeyDown}
        type="number"
        placeholder="Height (cm)"
        value={dim.height}
        onChange={(e) =>
          updateDimension(index, "height", e.target.value)
        }
        className={`border h-8 px-2 rounded ${
          errors[`dimension_${index}`] ? "border-red-500 bg-red-50" : ""
        }`}
      />

      <input
        ref={registerRef}
        onKeyDown={handleKeyDown}
        type="number"
        min={1}
        placeholder="Boxes"
        value={dim.count}
        onChange={(e) =>
          updateDimension(index, "count", e.target.value)
        }
        className={`border h-8 px-2 rounded ${
          errors[`dimension_count_${index}`]
            ? "border-red-500 bg-red-50"
            : ""
        }`}
      />

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


  {/* ================= RESPONSE ================= */}
<fieldset className="border p-4 mt-6">
  <legend className="font-semibold px-2">Response</legend>

  {awb && (
    <div className="space-y-2">
      <p className="text-green-700 font-semibold">
        ✅ Waybill Generated Successfully: {awb}
      </p>

      <a
        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybill/${awb}/pdf?size=${form.labelSize}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm"
      >
        ⬇ Download Waybill PDF
      </a>
    </div>
  )}

  {error && (
    <p className="text-red-600 font-semibold mt-2">
      ❌ {error}
    </p>
  )}
</fieldset>


  <button
    ref={registerRef}
    type="submit"
    disabled={loading}
    className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
  >
    {loading ? "Generating..." : "Submit"}
  </button>
</form>
  );
}
