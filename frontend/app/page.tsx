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

const mapShipperToForm = (shipper: any) => ({
  customerCode: shipper.CustomerCode || "",
  shipperName: shipper.CustomerName || "",
  sender: shipper.Sender || "",
  originArea: shipper.OriginArea || "",
  shipperMobile: shipper.CustomerMobile || "",
  shipperTelephone: shipper.CustomerTelephone || "",
  shipperAddress1: shipper.CustomerAddress1 || "",
  shipperAddress2: shipper.CustomerAddress2 || "",
  shipperAddress3: shipper.CustomerAddress3 || "",
  shipperPincode: shipper.CustomerPincode || "",
  isTopay: shipper.IsToPayCustomer || false,
});


/* ================= COMPONENT ================= */

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [awb, setAwb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReturnAddressDiffrent, setIsReturnAddressDiffrent] = useState(false);
  const [profile, setProfile] = useState<any>(null);


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


  useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipper-profile`)
    .then(res => {
      if (!res.ok) throw new Error("Profile fetch failed");
      return res.json();
    })
    .then(data => {
      if (!data) return;

      if(data?.shipper) {
        setForm(p => ({
          ...p,
          ...mapShipperToForm(data.shipper),
        }));
      }

      setProfile(data.profile);
    })
    .catch(err => {
      console.error("Shipper profile load error:", err);
      setError("Failed to load shipper profile");
    });
}, []);


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
    if (!form.pieceCount) e.pieceCount = "Required";

   
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

if (!profile) {
  setError("Shipper profile not loaded");
  setLoading(false);
  return;
}


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

      Profile: profile,
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

  // ---- Reusable Styles (put these inside your component, above the return) ----
const SECTION = "rounded-lg border border-gray-200 bg-white shadow-sm p-5 mb-6";
const LEGEND = "px-2 text-sm font-semibold";
const GRID_LABEL = "block text-xs font-medium text-gray-700 mb-1";
const INPUT_BASE =
  "h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
const SELECT_BASE = INPUT_BASE;
const INPUT_ERR = "border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200";

// Optional: If you own fieldClass(name), consider enhancing it like this:
// const fieldClass = (name) =>
//   `${INPUT_BASE} ${errors?.[name] ? INPUT_ERR : ""}`;

return (
  <form
    className="max-w-7xl mx-auto p-6 text-sm"
    onSubmit={(e) => {
      e.preventDefault();
      generateWaybill();
    }}
  >
    {/* PAGE HEADER */}
    <header className="mb-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Book A Shipment</h1>
      <p className="mt-1 text-gray-500 text-xs">
        Fill shipper, consignee, service & package details to generate a waybill.
      </p>
    </header>

    {/* ======================== SHIPPER ======================== */}
    <fieldset className={SECTION}>
      <legend className={LEGEND}>Shipper</legend>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className={GRID_LABEL}>Origin Area</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="originArea"
            value={form.originArea}
            onChange={handleChange}
            placeholder="e.g., DEL"
            maxLength={3}
            className={fieldClass("originArea")}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>Customer Code</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="customerCode"
            value={form.customerCode}
            onChange={handleChange}
            placeholder="6-digit"
            maxLength={6}
            className={fieldClass("customerCode")}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>Shipper Name</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="shipperName"
            value={form.shipperName}
            onChange={handleChange}
            placeholder="Company or Contact"
            className={fieldClass("shipperName")}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>Sender Name</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="sender"
            value={form.sender}
            onChange={handleChange}
            placeholder="Sender"
            className={INPUT_BASE}
          />
        </div>
      </div>

      {/* Pickup Address */}
      <fieldset className="rounded-md border border-gray-200 p-4">
        <legend className={`${LEGEND} text-gray-700`}>Pickup Address</legend>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className={GRID_LABEL}>Address Line 1</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="shipperAddress1"
              value={form.shipperAddress1}
              onChange={handleChange}
              placeholder="House No., Street"
              className={INPUT_BASE}
            />
          </div>
          <div className="md:col-span-1">
            <label className={GRID_LABEL}>Address Line 2</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="shipperAddress2"
              value={form.shipperAddress2}
              onChange={handleChange}
              placeholder="Area"
              className={INPUT_BASE}
            />
          </div>
          <div className="md:col-span-1">
            <label className={GRID_LABEL}>Address Line 3</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="shipperAddress3"
              value={form.shipperAddress3}
              onChange={handleChange}
              placeholder="City"
              className={INPUT_BASE}
            />
          </div>
          <div>
            <label className={GRID_LABEL}>Pincode</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="shipperPincode"
              value={form.shipperPincode}
              onChange={handleChange}
              placeholder="6-digit"
              maxLength={6}
              className={INPUT_BASE}
            />
          </div>
          <div>
            <label className={GRID_LABEL}>Mobile</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="shipperMobile"
              value={form.shipperMobile}
              onChange={handleChange}
              placeholder="+91 9XXXXXXXXX"
              className={INPUT_BASE}
            />
          </div>
        </div>
      </fieldset>

      {/* Return Address Toggle */}
      <fieldset className="rounded-md border border-gray-200 p-4 mt-3">
        <legend className={LEGEND}>Different Return Address?</legend>

        <div className="inline-flex rounded-md border bg-gray-100 p-1 mb-3">
          <button
            type="button"
            onClick={() => setIsReturnAddressDiffrent(true)}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              isReturnAddressDiffrent
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setIsReturnAddressDiffrent(false)}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              !isReturnAddressDiffrent
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            No
          </button>
        </div>

        {isReturnAddressDiffrent && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={GRID_LABEL}>Return Contact</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="returnContact"
                placeholder="Return Contact"
                onChange={handleChange}
                className={INPUT_BASE}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Return Mobile</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="returnMobile"
                placeholder="Return Mobile"
                onChange={handleChange}
                className={INPUT_BASE}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Return Address 1</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="returnAddress1"
                placeholder="Address line 1"
                onChange={handleChange}
                className={INPUT_BASE}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Return Address 2</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="returnAddress2"
                placeholder="Address line 2"
                onChange={handleChange}
                className={INPUT_BASE}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Return Address 3</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="returnAddress3"
                placeholder="Address line 3"
                onChange={handleChange}
                className={INPUT_BASE}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Return Pincode</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="returnPincode"
                placeholder="6-digit"
                onChange={handleChange}
                maxLength={6}
                className={INPUT_BASE}
              />
            </div>
          </div>
        )}
      </fieldset>
    </fieldset>

    {/* ======================== CONSIGNEE ======================== */}
    <fieldset className={SECTION}>
      <legend className={LEGEND}>Consignee</legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className={GRID_LABEL}>Company Name *</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="consigneeName"
            placeholder="Company Name"
            onChange={handleChange}
            className={fieldClass("consigneeName")}
          />
        </div>
        <div>
          <label className={GRID_LABEL}>Receiver Name</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="receiver"
            placeholder="Receiver Name"
            onChange={handleChange}
            className={INPUT_BASE}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className={GRID_LABEL}>Address Line 1 *</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="consigneeAddr1"
            placeholder="Address 1"
            onChange={handleChange}
            className={fieldClass("consigneeAddr1")}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>Address Line 2</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="consigneeAddr2"
            placeholder="Address 2"
            onChange={handleChange}
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>Address Line 3</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="consigneeAddr3"
            placeholder="Address 3"
            onChange={handleChange}
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>Pincode *</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="consigneePincode"
            placeholder="6-digit"
            onChange={handleChange}
            maxLength={6}
            className={fieldClass("consigneePincode")}
          />
        </div>

        <div className="md:col-span-2">
          <label className={GRID_LABEL}>Consignee Mobile *</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="consigneeMobile"
            placeholder="+91 9XXXXXXXXX"
            onChange={handleChange}
            className={fieldClass("consigneeMobile")}
          />
        </div>
      </div>
    </fieldset>

    {/* =================== SERVICE / PRODUCT =================== */}
    <fieldset className={SECTION}>
      <legend className={LEGEND}>Service &amp; Product</legend>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Service Type */}
        <div className="md:col-span-5">
          <label className={GRID_LABEL}>Service Type *</label>
          <select
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            className={`${SELECT_BASE} w-full`}
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
            <p className="text-xs text-red-600 mt-1">Service Type is required</p>
          )}
        </div>

        {/* Shipment Type */}
        <div className="md:col-span-3">
          <label className={GRID_LABEL}>Shipment Type *</label>
          <select
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="productType"
            value={form.productType}
            onChange={handleChange}
            className={`${SELECT_BASE} w-full`}
          >
            <option value="">Select</option>
            <option value="0">DOX</option>
            <option value="1">NDOX</option>
          </select>
        </div>

        {/* Label Size */}
        <div className="md:col-span-4">
          <label className={GRID_LABEL}>Label Size</label>
          <select
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="labelSize"
            value={form.labelSize}
            onChange={handleChange}
            className={`${SELECT_BASE} w-full`}
          >
            <option value="A4">A4</option>
            <option value="LABEL_4X6">4 × 6</option>
          </select>
        </div>
      </div>
    </fieldset>

    {/* =================== SHIPMENT DETAILS =================== */}
    <fieldset className={SECTION}>
      <legend className={LEGEND}>Shipment Details</legend>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div>
          <label className={GRID_LABEL}>Reference No</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="creditReferenceNo"
            placeholder="Ref No"
            onChange={handleChange}
            className={INPUT_BASE}
          />
        </div>

        <div>
          <label className={GRID_LABEL}>No. of Boxes</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="pieceCount"
            placeholder="No of Boxes"
            onChange={handleChange}
            className={INPUT_BASE}
          />
        </div>

        {isDuts && (
          <>
            <div>
              <label className={GRID_LABEL}>Declared Value</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="declaredValue"
                placeholder="Declared Value"
                onChange={handleChange}
                className={fieldClass("declaredValue")}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Invoice No</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="invoiceNumber"
                placeholder="Invoice No"
                onChange={handleChange}
                className={fieldClass("invoiceNumber")}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                ref={registerRef}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                className={`${INPUT_BASE} w-full`}
              />
            </div>

            <div>
              <label className={GRID_LABEL}>Pickup Date</label>
              <input
                type="date"
                name="pickupDate"
                ref={registerRef}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                className={`${INPUT_BASE} w-full`}
              />
            </div>
          </>
        )}

        <div>
          <label className={GRID_LABEL}>Weight (kg) *</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="weight"
            placeholder="Weight"
            onChange={handleChange}
            className={fieldClass("weight")}
          />
        </div>
      </div>

      {needsCollectable && (
        <div className="mt-3">
          <label className={GRID_LABEL}>COD Amount</label>
          <input
            ref={registerRef}
            onKeyDown={handleKeyDown}
            name="codAmount"
            placeholder="COD Amount"
            onChange={handleChange}
            className={fieldClass("codAmount")}
          />
        </div>
      )}

      {needsChequeDetails && (
        <fieldset className="border mt-4 p-4 rounded-md">
          <legend className={LEGEND}>DOD / FOD Details</legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={GRID_LABEL}>Favouring Name</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="favouringName"
                placeholder="Favouring Name"
                onChange={handleChange}
                className={fieldClass("favouringName")}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="text-xs">
                <input
                  type="radio"
                  name="isChequeDD"
                  value="Q"
                  checked={form.isChequeDD === "Q"}
                  onChange={handleChange}
                  className="mr-2"
                />
                Cheque
              </label>
              <label className="text-xs">
                <input
                  type="radio"
                  name="isChequeDD"
                  value="D"
                  checked={form.isChequeDD === "D"}
                  onChange={handleChange}
                  className="mr-2"
                />
                DD
              </label>
            </div>

            <div>
              <label className={GRID_LABEL}>Payable At</label>
              <input
                ref={registerRef}
                onKeyDown={handleKeyDown}
                name="payableAt"
                placeholder="Payable At"
                onChange={handleChange}
                className={fieldClass("payableAt")}
              />
            </div>
          </div>
        </fieldset>
      )}
    </fieldset>

    {/* =================== ITEM DETAILS =================== */}
    {isDuts && (
      <fieldset className={SECTION}>
        <legend className={LEGEND}>Item Details</legend>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className={GRID_LABEL}>Item Name *</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="itemName"
              placeholder="Item Name"
              value={form.itemName}
              onChange={handleChange}
              className={fieldClass("itemName")}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Qty</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="itemQty"
              type="number"
              min={1}
              placeholder="Qty"
              value={form.itemQty}
              onChange={handleChange}
              className={INPUT_BASE}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Item Value</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="itemValue"
              type="number"
              min={1}
              placeholder="Item Value"
              value={form.itemValue}
              onChange={handleChange}
              className={INPUT_BASE}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Commodity Details 1</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="comodityDetails1"
              placeholder="Commodity Details 1"
              value={form.comodityDetails1}
              onChange={handleChange}
              className={INPUT_BASE}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Commodity Details 2</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="comodityDetails2"
              placeholder="Commodity Details 2"
              value={form.comodityDetails2}
              onChange={handleChange}
              className={INPUT_BASE}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Commodity Details 3</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              name="comodityDetails3"
              placeholder="Commodity Details 3"
              value={form.comodityDetails3}
              onChange={handleChange}
              className={INPUT_BASE}
            />
          </div>
        </div>

        {errors.itemName && (
          <p className="text-xs text-red-600 mt-1">
            Item Name is required for NDOX shipments
          </p>
        )}
      </fieldset>
    )}

    {/* =================== PACKAGE DIMENSIONS =================== */}
    <fieldset className={SECTION}>
      <legend className={LEGEND}>Package Dimensions</legend>

      {dimensions.map((dim, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2 items-center"
        >
          <div>
            <label className={GRID_LABEL}>Length (cm)</label>
            <input
              ref={registerRef}
              name={`length_${index}`}
              onKeyDown={handleKeyDown}
              type="number"
              placeholder="Length"
              value={dim.length}
              onChange={(e) => updateDimension(index, "length", e.target.value)}
              className={`${INPUT_BASE} ${
                errors[`length_${index}`] ? INPUT_ERR : ""
              }`}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Breadth (cm)</label>
            <input
              ref={registerRef}
              name={`breadth_${index}`}
              onKeyDown={handleKeyDown}
              type="number"
              placeholder="Breadth"
              value={dim.breadth}
              onChange={(e) => updateDimension(index, "breadth", e.target.value)}
              className={`${INPUT_BASE} ${
                errors[`breadth_${index}`] ? INPUT_ERR : ""
              }`}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Height (cm)</label>
            <input
              ref={registerRef}
              name={`height_${index}`}
              onKeyDown={handleKeyDown}
              type="number"
              placeholder="Height"
              value={dim.height}
              onChange={(e) => updateDimension(index, "height", e.target.value)}
              className={`${INPUT_BASE} ${
                errors[`height_${index}`] ? INPUT_ERR : ""
              }`}
            />
          </div>

          <div>
            <label className={GRID_LABEL}>Boxes</label>
            <input
              ref={registerRef}
              onKeyDown={handleKeyDown}
              type="number"
              min={1}
              placeholder="Count"
              value={dim.count}
              onChange={(e) => updateDimension(index, "count", e.target.value)}
              className={`${INPUT_BASE} ${
                errors[`dimension_count_${index}`] ? INPUT_ERR : ""
              }`}
            />
          </div>

          {dimensions.length > 1 ? (
            <button
              type="button"
              onClick={() => removeDimension(index)}
              className="text-red-600 hover:text-red-700 text-xs font-medium self-end md:self-center"
              title="Remove row"
            >
              ✕ Remove
            </button>
          ) : (
            <div />
          )}
        </div>
      ))}

      <button
        ref={registerRef}
        onKeyDown={handleKeyDown}
        type="button"
        onClick={addDimension}
        className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
      >
        + Add Another Box
      </button>
    </fieldset>

    {/* =================== RESPONSE =================== */}
    <fieldset className={SECTION}>
      <legend className={LEGEND}>Response</legend>

      {awb && (
        <div className="space-y-2">
          <p className="text-green-700 font-semibold">
            ✅ Waybill Generated Successfully: {awb}
          </p>

          <a
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bluedart/waybill/${awb}/pdf?size=${form.labelSize}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            ⬇ Download Waybill PDF
          </a>
        </div>
      )}

      {error && (
        <p className="text-red-600 font-semibold mt-2">❌ {error}</p>
      )}
    </fieldset>

    {/* STICKY ACTION BAR (nice UX on long forms) */}
    <div className="sticky bottom-4 mt-6 flex justify-end">
      <button
        ref={registerRef}
        type="submit"
        disabled={loading || !profile}
        className="rounded-md bg-blue-600 px-6 py-2 text-white text-sm font-semibold shadow
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200
                   disabled:opacity-50"
      >
        {loading ? "Generating..." : "Submit"}
      </button>
    </div>
  </form>
);

}
