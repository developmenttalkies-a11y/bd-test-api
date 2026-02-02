package com.example.demo.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

@Service
public class BulkWaybillTemplateService {

    public byte[] generateTemplate() throws Exception {

        Workbook workbook = new XSSFWorkbook();
        Sheet waybill = workbook.createSheet("Waybill");
        Sheet dimensions = workbook.createSheet("Dimensions");
        Sheet itemDetails = workbook.createSheet("ItemDetails");


        String[] headers = {
        "Reference No *",
        "Billing Area *",
        "Billing Customer Code *",
        "Pickup Date *",
        "Pickup Time",
        "Shipper Name",
        "Pickup address *",
        "Pickup pincode *",
        "Company Name *",
        "Delivery address *",
        "Delivery Pincode *",
        "Product Code *",
        "Product Type *",
        "Sub Product Code",
        "Pack Type",
        "Piece Count *",
        "Actual Weight *",
        "Declared Value",
        "Register Pickup",
        "Length",
        "Breadth",
        "Height",
        "To Pay Customer",
        "Sender",
        "Vendor Code",
        "Sender Telephone",
        "Sender mobile",
        "Sender Email ID",
        "Receiver Telephone",
        "Receiver mobile",
        "Receiver Name",
        "Receiver Email ID",
        "Receiver Latitude",
        "Receiver Longitude",
        "Receiver Masked Contact Number",
        "Return Address",
        "Return Pincode",
        "Return Telephone",
        "Return Mobile",
        "Return Contact",
        "Invoice No",
        "Special Instruction",
        "Collectable Amount",
        "Preferred Delivery Date",
        "Commodity Detail 1",
        "Commodity Detail 2",
        "Commodity Detail 3",
        "Is Cheque or DD",
        "Insurance Paid By",
        "Favouring Name",
        "Payable At",
        "Delivery time slot",
        "Is Force pickup",
        "Reference No 2",
        "Reference No 3",
        "Item Count",
        "Is it a partial pickup",
        "OTP Based Delivery",
        "OTP Code",
        "No of DC given",
        "Office Closure time",
        "AWB No",
        "Status",
        "Message",
        "Cluster Code",
        "Destination Area",
        "Destination Location",
        "Pick Up Token No",
        "Response pick up date",
        "Transaction Amount",
        "Wallet Balance",
        "Available Booking Amount"
};


        String[] dimensionsHeaders = {
            "Reference No",	"Length",	"Breadth",	"Height","Count"
        };

        String[] itemDetailsHeaders = {
        "Reference No",
        "AWB No",
        "Item ID",
        "Item Name",
        "Product Desc 1",
        "Product Desc 2",
        "Sub product 1",
        "Sub product 2",
        "Item Value",
        "SKU Number",
        "Item quantity",
        "HS Code",
        "Taxable Amount",
        "CGST Amount",
        "SGST Amount",
        "Total Value",
        "Invoice Number",
        "Invoice Date",
        "Seller Name",
        "Seller GSTN Number",
        "Cess Amount",
        "EWay bill number",
        "EWay bill date",
        "Supply type",
        "Sub supply type",
        "Doc Type"
};


        // Header row
        Row headerRow = waybill.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            waybill.autoSizeColumn(i);
        }

        // // Sample row
        // Row sample = waybill.createRow(1);
        // sample.createCell(0).setCellValue("940111");
        // sample.createCell(1).setCellValue("Test Cust Name");
        // sample.createCell(2).setCellValue("9996665554");
        // sample.createCell(4).setCellValue("Test Cust Addr1");
        // sample.createCell(7).setCellValue("122002");
        // sample.createCell(8).setCellValue("GGN");
        // sample.createCell(10).setCellValue("Test Consignee");
        // sample.createCell(11).setCellValue("9995554441");
        // sample.createCell(13).setCellValue("Test Cngee Addr1");
        // sample.createCell(16).setCellValue("110027");
        // sample.createCell(18).setCellValue("P");
        // sample.createCell(19).setCellValue("A");
        // sample.createCell(20).setCellValue("0.50");
        // sample.createCell(21).setCellValue("100");
        // sample.createCell(22).setCellValue("1");
        // sample.createCell(23).setCellValue("0");
        // sample.createCell(24).setCellValue(LocalDate.now().toString());
        // sample.createCell(25).setCellValue("1600");
        // long epochSeconds = System.currentTimeMillis() / 1000;
        // String ref = "CR" + epochSeconds + "26";
        // sample.createCell(26).setCellValue(ref);
        // sample.createCell(27).setCellValue("Test Item1");
        // sample.createCell(28).setCellValue("100");
        // sample.createCell(29).setCellValue("1");

        // Sample row (row index 1)
Row sample = waybill.createRow(1);

// Reference / Billing
sample.createCell(0).setCellValue("CR940111");              // Reference No *
sample.createCell(1).setCellValue("DEL");                   // Billing Area *
sample.createCell(2).setCellValue("940111");               // Billing Customer Code *

// Pickup details
sample.createCell(3).setCellValue(LocalDate.now().toString()); // Pickup Date *
sample.createCell(4).setCellValue("1600");                  // Pickup Time
sample.createCell(5).setCellValue("Test Shipper");          // Shipper Name
sample.createCell(6).setCellValue("Test Pickup Address");   // Pickup address *
sample.createCell(7).setCellValue("122002");                // Pickup pincode *
sample.createCell(8).setCellValue("Test Company");          // Company Name *

// Delivery details
sample.createCell(9).setCellValue("Test Delivery Address"); // Delivery address *
sample.createCell(10).setCellValue("110027");               // Delivery Pincode *

// Product / shipment
sample.createCell(11).setCellValue("A");                    // Product Code *
sample.createCell(12).setCellValue("NDOX");                    // Product Type *
sample.createCell(13).setCellValue("C");                    // Sub Product Code
sample.createCell(14).setCellValue("L");                    // Pack Type
sample.createCell(15).setCellValue("1");                    // Piece Count *
sample.createCell(16).setCellValue("0.50");                 // Actual Weight *
sample.createCell(17).setCellValue("100");                  // Declared Value
sample.createCell(18).setCellValue("FALSE");                    // Register Pickup

// Dimensions
sample.createCell(19).setCellValue("30");                   // Length
sample.createCell(20).setCellValue("20");                   // Breadth
sample.createCell(21).setCellValue("10");                   // Height

// Sender
sample.createCell(22).setCellValue("FALSE");                     // To Pay Customer
sample.createCell(23).setCellValue("Test Sender");          // Sender
sample.createCell(24).setCellValue("VEND001");              // Vendor Code
sample.createCell(25).setCellValue("0123456789");           // Sender Telephone
sample.createCell(26).setCellValue("9996665554");           // Sender mobile
sample.createCell(27).setCellValue("sender@test.com");      // Sender Email ID

// Receiver
sample.createCell(28).setCellValue("0112345678");           // Receiver Telephone
sample.createCell(29).setCellValue("9995554441");           // Receiver mobile
sample.createCell(30).setCellValue("Test Consignee");       // Receiver Name
sample.createCell(31).setCellValue("consignee@test.com");   // Receiver Email ID
sample.createCell(32).setCellValue("");                     // Receiver Latitude
sample.createCell(33).setCellValue("");                     // Receiver Longitude
sample.createCell(34).setCellValue("");                     // Receiver Masked Contact Number

// Return details
sample.createCell(35).setCellValue("Return Address Test");  // Return Address
sample.createCell(36).setCellValue("122001");               // Return Pincode
sample.createCell(37).setCellValue("0119998887");           // Return Telephone
sample.createCell(38).setCellValue("9998887776");           // Return Mobile
sample.createCell(39).setCellValue("Return Contact");       // Return Contact

// Invoice / amounts
sample.createCell(40).setCellValue("INV001");               // Invoice No
sample.createCell(41).setCellValue("Handle with care");     // Special Instruction
sample.createCell(42).setCellValue("100");                  // Collectable Amount
sample.createCell(43).setCellValue("");                     // Preferred Delivery Date

// Commodity
sample.createCell(44).setCellValue("General Goods");        // Commodity Detail 1
sample.createCell(45).setCellValue("");                     // Commodity Detail 2
sample.createCell(46).setCellValue("");                     // Commodity Detail 3

// Payment / misc
sample.createCell(47).setCellValue("");                    // Is Cheque or DD
sample.createCell(48).setCellValue("");                    // Insurance Paid By
sample.createCell(49).setCellValue("");                     // Favouring Name
sample.createCell(50).setCellValue("");                     // Payable At
sample.createCell(51).setCellValue("");                     // Delivery time slot
sample.createCell(52).setCellValue("FALSE");                    // Is Force pickup

// References
sample.createCell(53).setCellValue("REF2");                 // Reference No 2
sample.createCell(54).setCellValue("REF3");                 // Reference No 3

// Item / OTP
sample.createCell(55).setCellValue("1");                    // Item Count
sample.createCell(56).setCellValue("FALSE");                    // Is it a partial pickup
sample.createCell(57).setCellValue("FALSE");                    // OTP Based Delivery
sample.createCell(58).setCellValue("");                     // OTP Code

// Other
sample.createCell(59).setCellValue("0");                    // No of DC given
sample.createCell(60).setCellValue("");                     // Office Closure time

// Response fields (filled after booking)
sample.createCell(61).setCellValue("");                     // AWB No
sample.createCell(62).setCellValue("");                     // Status
sample.createCell(63).setCellValue("");                     // Message
sample.createCell(64).setCellValue("");                     // Cluster Code
sample.createCell(65).setCellValue("");                     // Destination Area
sample.createCell(66).setCellValue("");                     // Destination Location
sample.createCell(67).setCellValue("");                     // Pick Up Token No
sample.createCell(68).setCellValue("");                     // Response pick up date
sample.createCell(69).setCellValue("");                     // Transaction Amount
sample.createCell(70).setCellValue("");                     // Wallet Balance
sample.createCell(71).setCellValue("");                     // Available Booking Amount


        Row dimensionsHeaderRow=dimensions.createRow(0);
        for(int j=0;j<dimensionsHeaders.length;j++) {
            Cell dimCell=dimensionsHeaderRow.createCell(j);
            dimCell.setCellValue(dimensionsHeaders[j]);
            dimensions.autoSizeColumn(j);
        }

        Row itemDetailsHeaderRow = itemDetails.createRow(0);

for (int i = 0; i < itemDetailsHeaders.length; i++) {
    Cell cell = itemDetailsHeaderRow.createCell(i);
    cell.setCellValue(itemDetailsHeaders[i]);
    itemDetails.autoSizeColumn(i);
}


        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return out.toByteArray();
    }

    public byte[] generateCancelTemplate() throws Exception {
        Workbook wb=new XSSFWorkbook();
        Sheet sheet=wb.createSheet("AwbNo");
        Row headerRow=sheet.createRow(0);
        Cell cell=headerRow.createCell(0);
        cell.setCellValue("AwbNo");
        Row sample=sheet.createRow(1);
        sample.createCell(0).setCellValue("1234567890");

        ByteArrayOutputStream out=new ByteArrayOutputStream();
        wb.write(out);
        wb.close();
        return out.toByteArray();
    }


}
