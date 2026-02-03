package com.example.demo.service;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.time.ZoneId;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BulkWaybillFileParser {

    public List<Map<String, Object>> parse(MultipartFile file) throws Exception {

        String filename = file.getOriginalFilename().toLowerCase();

        if (filename.endsWith(".csv")) {
            System.out.println("Parsing CSV file");
            return parseCsv(file);
        } else if (filename.endsWith(".xlsx")) {
            return parseXlsx(file); 
        }

        throw new IllegalArgumentException("Unsupported file type");
    }

    /* ================= CSV PARSING ================= */

    private List<Map<String, Object>> parseCsv(MultipartFile file) throws Exception {

    List<Map<String, Object>> requests = new ArrayList<>();

    CSVParser parser = CSVFormat.DEFAULT
            .withFirstRecordAsHeader()
            .withIgnoreHeaderCase()
            .withTrim()
            .parse(new InputStreamReader(file.getInputStream()));

    for (CSVRecord record : parser) {

        Map<String, String> rowData = new HashMap<>();

        // for (String header : parser.getHeaderMap().keySet()) {
        //     rowData.put(header, record.get(header).trim());
        // }

for (String header : parser.getHeaderMap().keySet()) {

    String normalizedKey = header
            .replace("\uFEFF", "")   // remove BOM
            .replace(" ", "")        // remove spaces
            .trim();

    rowData.put(normalizedKey, record.get(header).trim());
}


        requests.add(buildWaybillRequest(rowData));
    }

    return requests;
}

    /* ================= DATE CONVERSION ================= */   

private String toBluedartDate(String dateStr) {

    if (dateStr == null || dateStr.isBlank()) {
        throw new RuntimeException("PickupDate is mandatory");
    }

    dateStr = dateStr.trim();

    LocalDate date;

    // Support multiple formats
    if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
        // yyyy-MM-dd
        date = LocalDate.parse(dateStr);
    } else if (dateStr.matches("\\d{2}-\\d{2}-\\d{4}")) {
        // dd-MM-yyyy
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd-MM-yyyy");
        date = LocalDate.parse(dateStr, formatter);
    } else {
        throw new RuntimeException(
            "Invalid PickupDate format. Use yyyy-MM-dd or dd-MM-yyyy"
        );
    }

    long millis = date
            .atStartOfDay(ZoneId.systemDefault())
            .toInstant()
            .toEpochMilli();

    return "/Date(" + millis + ")/";
}

     /* ================= XLSX PARSING ================= */

    private List<Map<String, Object>> parseXlsx(MultipartFile file) throws Exception {

    List<Map<String, Object>> requests = new ArrayList<>();

    Workbook workbook = new XSSFWorkbook(file.getInputStream());
    //Sheet sheet = workbook.getSheetAt(0); // single sheet only
    Sheet wSheet = workbook.getSheet("Waybill"); // waybill sheet
    Sheet dSheet = workbook.getSheet("Dimensions"); // dimensions sheet
    Sheet iSheet = workbook.getSheet("ItemDetails"); // itemdetails sheet


    if (wSheet == null) throw new RuntimeException("Waybill sheet not found");
    if (dSheet == null) throw new RuntimeException("Dimensions sheet not found");
    if (iSheet == null) throw new RuntimeException("ItemDetails sheet not found");


    // Parse child sheets FIRST
    Map<String, List<Map<String, String>>> dimensionRows = parseMultiRowSheet(dSheet);
    Map<String, List<Map<String, String>>> itemRows = parseMultiRowSheet(iSheet);

    Row wHeaderRow = wSheet.getRow(0);
    // if (wHeaderRow == null) {
    //     workbook.close();
    //     throw new RuntimeException("Excel header row is missing");
    // }

    Row dHeaderRow = dSheet.getRow(0);
    // if (dHeaderRow == null) {
    //     workbook.close();
    //     throw new RuntimeException("Dimensions sheet header row is missing");
    // }

    Row iHeaderRow = iSheet.getRow(0);
    // if (iHeaderRow == null) {
    //     workbook.close();
    //     throw new RuntimeException("ItemDetails sheet header row is missing");
    // }

    Map<String, Map<String, String>> waybillRows;


    DataFormatter formatter = new DataFormatter(); // ⭐ KEY FIX
    Map<Integer, String> headerMap = new HashMap<>();
    for(int j = 0; j < wHeaderRow.getLastCellNum(); j++) {
        Cell headerCell = wHeaderRow.getCell(j);
        if (headerCell != null) {
            String headerName = normalizeHeader(headerCell.getStringCellValue());
            headerMap.put(j, headerName);
        }
    }

    for (int i = 1; i <= wSheet.getLastRowNum(); i++) {
        Row row = wSheet.getRow(i);
        if (row == null) continue;

        Map<String, String> waybillRow = new HashMap<>();

    //     for (int j = 0; j < headerRow.getLastCellNum(); j++) {
    //         Cell headerCell = headerRow.getCell(j);
    //         Cell cell = row.getCell(j);

    //         if (headerCell == null) continue;

    //         String key = headerCell.getStringCellValue().trim();
    //         String value = cell == null ? "" : formatter.formatCellValue(cell).trim();

    //         rowData.put(key, value);
    //     }

    //     requests.add(buildWaybillRequest(rowData));
    // }

    for(Map.Entry<Integer,String> entry : headerMap.entrySet()){
        Cell cell=row.getCell(entry.getKey());
        String value=cell==null ? "" : formatter.formatCellValue(cell).trim();
        waybillRow.put(entry.getValue(), value);
    }

    
        String refNo = waybillRow.get("referenceno");
        if (refNo == null || refNo.isBlank()) continue;

        List<Map<String, String>> dims = dimensionRows.get(refNo);
        List<Map<String, String>> items = itemRows.get(refNo);
        
        requests.add(buildWaybillRequest(waybillRow));
    }

    workbook.close();
    return requests;
}


private Map<String, List<Map<String, String>>> parseMultiRowSheet(Sheet sheet) {

    Map<String, List<Map<String, String>>> result = new HashMap<>();
    DataFormatter formatter = new DataFormatter();

    Row header = sheet.getRow(0);
    Map<Integer, String> headerMap = new HashMap<>();

    for (int j = 0; j < header.getLastCellNum(); j++) {
        Cell cell = header.getCell(j);
        if (cell != null) {
            headerMap.put(j, normalizeHeader(cell.getStringCellValue()));
        }
    }

    for (int i = 1; i <= sheet.getLastRowNum(); i++) {
        Row row = sheet.getRow(i);
        if (row == null) continue;

        Map<String, String> data = new HashMap<>();
        String refNo = "";

        for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
            Cell cell = row.getCell(entry.getKey());
            String value = cell == null ? "" : formatter.formatCellValue(cell).trim();
            data.put(entry.getValue(), value);

            if ("referenceno".equals(entry.getValue())) {
                refNo = value;
            }
        }

        if (!refNo.isBlank()) {
            result.computeIfAbsent(refNo, k -> new ArrayList<>()).add(data);
        }
    }

    return result;
}




    /* ================= ROW → REQUEST ================= */
private Map<String, Object> buildWaybillRequest(
    Map<String, String> row
){

    /* ---------- SHIPPER ---------- */
    Map<String, Object> shipper = new HashMap<>();
    shipper.put("CustomerCode", row.get("billingcustomercode"));
shipper.put("CustomerName", row.get("shippername"));
shipper.put("CustomerMobile", row.get("sendermobile"));
shipper.put("CustomerAddress1", row.get("pickupaddress"));
shipper.put("CustomerPincode", row.get("pickuppincode"));
shipper.put("OriginArea", row.get("billingarea"));

    shipper.put("CustomerAddress2", "");
    shipper.put("CustomerAddress3", "");
    shipper.put("CustomerAddressinfo", "");
    shipper.put("CustomerTelephone", row.get("sendertelephone"));
    shipper.put("CustomerEmailID", row.get("senderemailid"));
    shipper.put("IsToPayCustomer", safeBoolean(row.get("topaycustomer")));
    //shipper.put("Sender", "BulkUpload");
    shipper.put("VendorCode", row.get("vendorcode"));

    /* ---------- CONSIGNEE ---------- */
    Map<String, Object> consignee = new HashMap<>();
    consignee.put("ConsigneeName", row.get("companyname"));
    consignee.put("ConsigneeMobile", row.get("receivermobile"));
    consignee.put("ConsigneeAddress1", row.get("deliveryaddress"));
    consignee.put("ConsigneeAddress2", "");
    consignee.put("ConsigneeAddress3", "");
    consignee.put("ConsigneeAddressinfo", "");
    consignee.put("ConsigneePincode", row.get("deliverypincode"));
    consignee.put("ConsigneeTelephone", row.get("receivertelephone"));
    consignee.put("ConsigneeEmailID", row.get("receiveremailid"));
    consignee.put("ConsigneeAttention", row.get("receivername"));
    consignee.put("AvailableDays", "");
    consignee.put("AvailableTiming", "");

    /* ---------- SERVICES ---------- */
    Map<String, Object> services = new HashMap<>();
    services.put("AWBNo", row.get("awbno")); // if customer provides waybill no
    services.put("ProductCode", row.get("productcode"));
    services.put("SubProductCode", row.get("subproductcode"));
    services.put("ProductType", 1);
    services.put("ActualWeight", safeDouble(row.get("actualweight")));
    services.put("DeclaredValue", safeDouble(row.get("declaredvalue")));
    services.put("PieceCount", safeInt(row.get("piececount")));
    services.put("ItemCount", safeInt(row.get("itemcount")));
    services.put("CollectableAmount", safeDouble(row.get("collectableamount")));
    services.put("CreditReferenceNo", row.get("referenceno"));
    services.put("CreditReferenceNo2", row.get("referenceno2"));
    services.put("CreditReferenceNo3", row.get("referenceno3"));

    services.put("PickupDate", toBluedartDate(row.get("pickupdate")));
    services.put("PickupTime", row.get("pickuptime"));
    services.put("PickupMode", "");
    services.put("PickupType", "");
    services.put("RegisterPickup", safeBoolean(row.get("registerpickup")));

    services.put("PDFOutputNotRequired", true);
    services.put("PackType", row.get("packtype"));
    services.put("ParcelShopCode", "");
    services.put("PayableAt", row.get("payableat"));

    services.put("IsReversePickup", false);
    services.put("IsPartialPickup", safeBoolean(row.get("ispartialpickup")));
    services.put("IsForcePickup", safeBoolean(row.get("isforcepickup")));
    services.put("IsDedicatedDeliveryNetwork", false);
    services.put("IsDutyTaxPaidByShipper", false);

    services.put("TotalCashPaytoCustomer", 0);
    services.put("Officecutofftime", row.get("officeclosuretime"));
    services.put("PreferredPickupTimeSlot", "");
    services.put("DeliveryTimeSlot",row.get("deliverytimeslot"));
    services.put("ProductFeature", "");
    services.put("SpecialInstruction", row.get("specialinstruction"));
    services.put("noOfDCGiven",row.get("noofdcgiven"));

    /* ---------- COMMODITY ---------- */
    Map<String, Object> commodity = new HashMap<>();
    commodity.put("CommodityDetail1", row.get("commoditydetail1"));
    commodity.put("CommodityDetail2", row.get("commoditydetail2"));
    commodity.put("CommodityDetail3", row.get("commoditydetail3"));
    services.put("Commodity", commodity);

        /* ---------- DIMENSIONS ---------- */
    // List<Map<String, Object>> dimensions = new ArrayList<>();

    //     if (dimensionRows != null) {
    //         for (Map<String, String> d : dimensionRows) {
    //             Map<String, Object> dim = new HashMap<>();
    //             dim.put("Length", safeDouble(d.get("length")));
    //             dim.put("Breadth", safeDouble(d.get("breadth")));
    //             dim.put("Height", safeDouble(d.get("height")));
    //             dim.put("Count", safeInt(d.get("count")));
    //             dimensions.add(dim);
    //         }
    // }

    //     if (!dimensions.isEmpty()) {
    //         services.put("Dimensions", dimensions);
    //     }


    Map<String, Object> dimensions = new HashMap<>();
    dimensions.put("Length", safeDouble(row.get("length")));
    dimensions.put("Breadth", safeDouble(row.get("breadth")));
    dimensions.put("Height", safeDouble(row.get("height")));
    dimensions.put("Count", safeInt(row.get("piececount")));
    services.put("Dimensions",List.of(dimensions));

    /* ---------- ITEM ---------- */
// List<Map<String, Object>> items = new ArrayList<>();

// if (itemRows != null) {
//     for (Map<String, String> r : itemRows) {
//         Map<String, Object> item = new HashMap<>();
//         item.put("ItemName", r.get("itemname"));
//         item.put("ItemValue", safeDouble(r.get("itemvalue")));
//         item.put("Itemquantity", safeInt(r.get("itemquantity")));
//         item.put("TotalValue", safeDouble(r.get("totalvalue")));
//         items.add(item);
//     }
// }

// if (!items.isEmpty()) {
//     services.put("itemdtl", items);
// }

// Map<String,Object> itemdtl=new HashMap<>();
// itemdtl.put()

    /* ---------- REQUEST ---------- */
    Map<String, Object> request = new HashMap<>();
    request.put("Shipper", shipper);
    request.put("Consignee", consignee);
    request.put("Services", services);

    /* ---------- PROFILE ---------- */
    Map<String, Object> profile = new HashMap<>();
    profile.put("LoginID", "GG940111");
    profile.put("LicenceKey", "kh7mnhqkmgegoksipxr0urmqesesseup");
    profile.put("Api_type", "S");

    /* ---------- FINAL PAYLOAD ---------- */
    Map<String, Object> finalPayload = new HashMap<>();
    finalPayload.put("Request", request);
    finalPayload.put("Profile", profile);

    return finalPayload;
}


private int safeInt(String value) {
    if (value == null || value.isBlank()) return 0;
    return Integer.parseInt(value);
}

private double safeDouble(String value) {
    if (value == null || value.isBlank()) return 0.0;
    return Double.parseDouble(value);
}

private boolean safeBoolean(String value) {
    if (value == null) return false;

    value = value.trim().toLowerCase();

    return value.equals("true")
        || value.equals("yes")
        || value.equals("y")
        || value.equals("1");
}

private String normalizeHeader(String header) {
    if (header == null) return "";
    return header
            .replace("\uFEFF", "")   // BOM
            .replace("*", "")        // required marker
            .replace(" ", "")        // spaces
            .trim()
            .toLowerCase();          // case-insensitive
}


}
