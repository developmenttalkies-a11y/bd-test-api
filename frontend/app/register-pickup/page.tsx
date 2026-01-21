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
    <div style={{ maxWidth: 400 }}>
      <h1>Register Pickup</h1>

      <input
        placeholder="Customer Code"
        value={form.customerCode}
        onChange={(e) =>
          setForm({ ...form, customerCode: e.target.value })
        }
      />

      <input
        placeholder="Pincode"
        value={form.customerPincode}
        onChange={(e) =>
          setForm({ ...form, customerPincode: e.target.value })
        }
      />

      <input
        placeholder="Contact Person Name"
        value={form.contactPersonName}
        onChange={(e) =>
          setForm({
            ...form,
            contactPersonName: e.target.value,
          })
        }
      />

        <input
        placeholder="CustomerAddress1"
        value={form.customerAddress1}
        onChange={(e) =>
          setForm({
            ...form,
            customerAddress1: e.target.value,
          })
        }
      />

        <input
        placeholder="CustomerAddress2"
        value={form.customerAddress2}
        onChange={(e) =>
          setForm({
            ...form,
            customerAddress2: e.target.value,
          })
        }
      />

        <input
        placeholder="CustomerAddress3"
        value={form.customerAddress3}
        onChange={(e) =>
          setForm({
            ...form,
            customerAddress3: e.target.value,
          })
        }
      />

      <input
        placeholder="WeightOfShipment"
        value={form.shipmentWeight}
        onChange={(e) =>
          setForm({
            ...form,
            shipmentWeight: parseFloat(e.target.value),
          })
        }
      />

      <input
        placeholder="No Of Piece"
        value={form.noOfPiece}
        onChange={(e) =>
          setForm({
            ...form,
            noOfPiece: Number(e.target.value),
          })
        }
      />


      <button onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
