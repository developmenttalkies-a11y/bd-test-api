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
    Sheet sheet = workbook.getSheetAt(0); // single sheet only

    Row headerRow = sheet.getRow(0);
    if (headerRow == null) {
        throw new RuntimeException("Excel header row is missing");
    }

    DataFormatter formatter = new DataFormatter(); // ⭐ KEY FIX

    for (int i = 1; i <= sheet.getLastRowNum(); i++) {
        Row row = sheet.getRow(i);
        if (row == null) continue;

        Map<String, String> rowData = new HashMap<>();

        for (int j = 0; j < headerRow.getLastCellNum(); j++) {
            Cell headerCell = headerRow.getCell(j);
            Cell cell = row.getCell(j);

            if (headerCell == null) continue;

            String key = headerCell.getStringCellValue().trim();
            String value = cell == null ? "" : formatter.formatCellValue(cell).trim();

            rowData.put(key, value);
        }

        requests.add(buildWaybillRequest(rowData));
    }

    workbook.close();
    return requests;
}



    /* ================= ROW → REQUEST ================= */
private Map<String, Object> buildWaybillRequest(Map<String, String> row) {

    /* ---------- SHIPPER ---------- */
    Map<String, Object> shipper = new HashMap<>();
    shipper.put("CustomerCode", row.get("CustomerCode"));
    shipper.put("CustomerName", row.get("CustomerName"));
    shipper.put("CustomerMobile", row.get("CustomerMobile"));
    shipper.put("CustomerAddress1", row.get("CustomerAddress1"));
    shipper.put("CustomerAddress2", "");
    shipper.put("CustomerAddress3", "");
    shipper.put("CustomerAddressinfo", "");
    shipper.put("CustomerPincode", row.get("CustomerPincode"));
    shipper.put("CustomerTelephone", "");
    shipper.put("CustomerEmailID", "test@bd.com");
    shipper.put("IsToPayCustomer", false);
    shipper.put("OriginArea", row.get("OriginArea"));
    shipper.put("Sender", "BulkUpload");
    shipper.put("VendorCode", "");

    /* ---------- CONSIGNEE ---------- */
    Map<String, Object> consignee = new HashMap<>();
    consignee.put("ConsigneeName", row.get("ConsigneeName"));
    consignee.put("ConsigneeMobile", row.get("ConsigneeMobile"));
    consignee.put("ConsigneeAddress1", row.get("ConsigneeAddress1"));
    consignee.put("ConsigneeAddress2", "");
    consignee.put("ConsigneeAddress3", "");
    consignee.put("ConsigneeAddressinfo", "");
    consignee.put("ConsigneePincode", row.get("ConsigneePincode"));
    consignee.put("ConsigneeTelephone", "");
    consignee.put("ConsigneeEmailID", "test@bd.com");
    consignee.put("ConsigneeAttention", "Bulk");
    consignee.put("AvailableDays", "");
    consignee.put("AvailableTiming", "");

    /* ---------- SERVICES ---------- */
    Map<String, Object> services = new HashMap<>();
    services.put("AWBNo", "");
    services.put("ProductCode", row.get("ProductCode"));
    services.put("SubProductCode", row.get("SubProductCode"));
    services.put("ProductType", 1);
    services.put("ActualWeight", safeDouble(row.get("ActualWeight")));
    services.put("DeclaredValue", safeDouble(row.get("DeclaredValue")));
    services.put("PieceCount", safeInt(row.get("PieceCount")));
    services.put("ItemCount", safeInt(row.get("PieceCount")));
    services.put("CollectableAmount", safeDouble(row.get("CollectableAmount")));
    services.put("CreditReferenceNo", row.get("CreditReferenceNo"));
    services.put("CreditReferenceNo2", "");
    services.put("CreditReferenceNo3", "");

    services.put("PickupDate", toBluedartDate(row.get("PickupDate")));
    services.put("PickupTime", "1600");
    services.put("PickupMode", "");
    services.put("PickupType", "");
    services.put("RegisterPickup", true);

    services.put("PDFOutputNotRequired", true);
    services.put("PackType", "");
    services.put("ParcelShopCode", "");
    services.put("PayableAt", "");

    services.put("IsReversePickup", false);
    services.put("IsPartialPickup", false);
    services.put("IsForcePickup", false);
    services.put("IsDedicatedDeliveryNetwork", false);
    services.put("IsDutyTaxPaidByShipper", false);

    services.put("TotalCashPaytoCustomer", 0);
    services.put("Officecutofftime", "");
    services.put("PreferredPickupTimeSlot", "");
    services.put("DeliveryTimeSlot", "");
    services.put("ProductFeature", "");
    services.put("SpecialInstruction", "");
    services.put("noOfDCGiven", 0);

    /* ---------- COMMODITY ---------- */
    Map<String, Object> commodity = new HashMap<>();
    commodity.put("CommodityDetail1", "General Goods");
    commodity.put("CommodityDetail2", "");
    commodity.put("CommodityDetail3", "");
    services.put("Commodity", commodity);

    /* ---------- DIMENSIONS ---------- */
    Map<String, Object> dimension = new HashMap<>();
    dimension.put("Length", 10.0);
    dimension.put("Breadth", 10.0);
    dimension.put("Height", 10.0);
    dimension.put("Count", 1);
    services.put("Dimensions", List.of(dimension));

    /* ---------- ITEM ---------- */
    Map<String, Object> item = new HashMap<>();
    item.put("ItemName", row.get("ItemName"));
    item.put("ItemValue", safeDouble(row.get("ItemValue")));
    item.put("Itemquantity", safeInt(row.get("Itemquantity")));
    item.put("TotalValue", safeDouble(row.get("ItemValue")));
    item.put("InvoiceNumber", "");
    item.put("InvoiceDate", toBluedartDate(row.get("PickupDate")));
    services.put("itemdtl", List.of(item));

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

}
