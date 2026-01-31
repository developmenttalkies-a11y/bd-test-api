"use client";
import { useEffect, useState } from "react";

const initialShipper = {
  CustomerCode: "",
  OriginArea: "",
  CustomerName: "",
  CustomerAddress1: "",
  CustomerAddress2: "",
  CustomerAddress3: "",
  CustomerPincode: "",
  CustomerMobile: "",
  CustomerTelephone: "",
  Sender: "",
  IsToPayCustomer: false,
};

const initialProfile = {
  LoginID: "",
  LicenceKey: "",
  Api_type: "S",
};

export default function ProfilePage() {
  const [shipper, setShipper] = useState(initialShipper);
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipper-profile`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.shipper) setShipper(data.shipper);
        if (data?.profile) setProfile(data.profile);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
      });
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleShipperChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setShipper((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- SAVE ---------------- */

  const saveProfile = async () => {
    setLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shipper-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shipper,
            profile,
          }),
        }
      );

      alert("Profile saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const textBoxStyle="border h-8 px-2 rounded";

  /* ---------------- UI ---------------- */

return (
  <div className="mx-auto w-full max-w-3xl p-6">
    {/* Page Title */}
    <div className="mb-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Shipper Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Provide shipper details and your API credentials below.
      </p>
    </div>

    {/* SHIPPER CARD */}
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold">Shipper</h2>
        <p className="mt-1 text-xs text-gray-500">
          These details appear on waybills and shipping labels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2">
        {/* Origin Area */}
        <div className="flex flex-col">
          <label htmlFor="OriginArea" className="mb-1 text-sm font-medium text-gray-700">
            Origin Area
          </label>
          <input
            id="OriginArea"
            name="OriginArea"
            value={shipper.OriginArea}
            onChange={handleShipperChange}
            placeholder="e.g., DEL"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Customer Code */}
        <div className="flex flex-col">
          <label htmlFor="CustomerCode" className="mb-1 text-sm font-medium text-gray-700">
            Customer Code
          </label>
          <input
            id="CustomerCode"
            name="CustomerCode"
            value={shipper.CustomerCode}
            onChange={handleShipperChange}
            placeholder="e.g., CUS12345"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Shipper Name */}
        <div className="flex flex-col">
          <label htmlFor="CustomerName" className="mb-1 text-sm font-medium text-gray-700">
            Shipper Name
          </label>
          <input
            id="CustomerName"
            name="CustomerName"
            value={shipper.CustomerName}
            onChange={handleShipperChange}
            placeholder="Company or Contact Name"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="organization"
          />
        </div>

        {/* Address Line 1 */}
        <div className="flex flex-col">
          <label htmlFor="CustomerAddress1" className="mb-1 text-sm font-medium text-gray-700">
            Address Line 1
          </label>
          <input
            id="CustomerAddress1"
            name="CustomerAddress1"
            value={shipper.CustomerAddress1}
            onChange={handleShipperChange}
            placeholder="House No., Street"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="address-line1"
          />
        </div>

        {/* Address Line 2 */}
        <div className="flex flex-col">
          <label htmlFor="CustomerAddress2" className="mb-1 text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <input
            id="CustomerAddress2"
            name="CustomerAddress2"
            value={shipper.CustomerAddress2}
            onChange={handleShipperChange}
            placeholder="Landmark, Locality"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="address-line2"
          />
        </div>

        {/* Address Line 3 */}
        <div className="flex flex-col">
          <label htmlFor="CustomerAddress3" className="mb-1 text-sm font-medium text-gray-700">
            Address Line 3
          </label>
          <input
            id="CustomerAddress3"
            name="CustomerAddress3"
            value={shipper.CustomerAddress3}
            onChange={handleShipperChange}
            placeholder="Area, City"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Pincode */}
        <div className="flex flex-col">
          <label htmlFor="CustomerPincode" className="mb-1 text-sm font-medium text-gray-700">
            Pincode
          </label>
          <input
            id="CustomerPincode"
            name="CustomerPincode"
            value={shipper.CustomerPincode}
            onChange={handleShipperChange}
            placeholder="6-digit PIN"
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="postal-code"
          />
        </div>

        {/* Mobile */}
        <div className="flex flex-col">
          <label htmlFor="CustomerMobile" className="mb-1 text-sm font-medium text-gray-700">
            Mobile
          </label>
          <input
            id="CustomerMobile"
            name="CustomerMobile"
            value={shipper.CustomerMobile}
            onChange={handleShipperChange}
            placeholder="+91 9XXXXXXXXX"
            inputMode="tel"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="tel"
          />
          <span className="mt-1 text-xs text-gray-400">
            We’ll use this for shipment notifications.
          </span>
        </div>
      </div>
    </section>

    {/* Spacer */}
    <div className="h-6" />

    {/* API PROFILE CARD */}
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold">API Profile</h2>
        <p className="mt-1 text-xs text-gray-500">
          Your credentials for authenticating API requests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2">
        {/* Login ID */}
        <div className="flex flex-col">
          <label htmlFor="LoginID" className="mb-1 text-sm font-medium text-gray-700">
            Login ID
          </label>
          <input
            id="LoginID"
            name="LoginID"
            value={profile.LoginID}
            onChange={handleProfileChange}
            placeholder="Enter Login ID"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="username"
          />
        </div>

        {/* Licence Key */}
        <div className="flex flex-col">
          <label htmlFor="LicenceKey" className="mb-1 text-sm font-medium text-gray-700">
            Licence Key
          </label>
          <input
            id="LicenceKey"
            name="LicenceKey"
            value={profile.LicenceKey}
            onChange={handleProfileChange}
            placeholder="Enter Licence Key"
            className="h-10 rounded-md border border-gray-300 px-3 text-sm shadow-sm outline-none transition
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoComplete="new-password"
          />
        </div>
      </div>
    </section>

    {/* Actions */}
    <div className="mt-8 flex items-center justify-end gap-3">
      <button
        type="button"
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
                   hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Cancel
      </button>

      <button
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow
                   transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={saveProfile}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Saving…
          </>
        ) : (
          'Save Profile'
        )}
      </button>
    </div>
  </div>
);
}