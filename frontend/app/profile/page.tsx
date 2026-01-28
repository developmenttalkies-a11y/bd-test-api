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

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Shipper Profile</h2>

      <input
        name="CustomerName"
        value={shipper.CustomerName}
        onChange={handleShipperChange}
        placeholder="Shipper Name"
      />

      <input
        name="CustomerCode"
        value={shipper.CustomerCode}
        onChange={handleShipperChange}
        placeholder="Customer Code"
      />

      <input
        name="OriginArea"
        value={shipper.OriginArea}
        onChange={handleShipperChange}
        placeholder="Origin Area"
      />

      <input
        name="CustomerAddress1"
        value={shipper.CustomerAddress1}
        onChange={handleShipperChange}
        placeholder="Address Line 1"
      />

      <input
        name="CustomerAddress2"
        value={shipper.CustomerAddress2}
        onChange={handleShipperChange}
        placeholder="Address Line 2"
      />

      <input
        name="CustomerAddress3"
        value={shipper.CustomerAddress3}
        onChange={handleShipperChange}
        placeholder="Address Line 3"
      />

      <input
        name="CustomerPincode"
        value={shipper.CustomerPincode}
        onChange={handleShipperChange}
        placeholder="Pincode"
      />

      <input
        name="CustomerMobile"
        value={shipper.CustomerMobile}
        onChange={handleShipperChange}
        placeholder="Mobile"
      />

      <h3 style={{ marginTop: 20 }}>API Profile</h3>

      <input
        name="LoginID"
        value={profile.LoginID}
        onChange={handleProfileChange}
        placeholder="Login ID"
      />

      <input
        name="LicenceKey"
        value={profile.LicenceKey}
        onChange={handleProfileChange}
        placeholder="Licence Key"
      />

      <br /><br />

      <button onClick={saveProfile} disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
