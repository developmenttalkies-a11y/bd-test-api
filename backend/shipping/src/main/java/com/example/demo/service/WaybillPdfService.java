package com.example.demo.service;

import com.example.demo.model.WaybillRecord;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.List;

@Service
public class WaybillPdfService {

    private static final DateTimeFormatter OUTPUT_DATE =
            DateTimeFormatter.ofPattern("dd-MM-yyyy");

    @SuppressWarnings("unchecked")
    public byte[] generatePdf(WaybillRecord record,String size) throws Exception {

        //Document document = new Document(PageSize.A4, 20, 20, 20, 20);
        Document document = createDocument(size);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        if("LABEL_4X6".equals(size)){
            //Single label
            document.add(createWaybillBlock(record));
        } else {
            //A4 with 4 labels
           PdfPTable grid = new PdfPTable(2);
           grid.setWidthPercentage(100);
           grid.setWidths(new float[]{1f, 1f});

           for (int i = 0; i < 4; i++) {
               PdfPCell cell = new PdfPCell(createWaybillBlock(record));
               cell.setPadding(6);
               cell.setBorderWidth(0.5f);
               grid.addCell(cell);
           } 

              document.add(grid);   
        }
        document.close();
        return out.toByteArray();
    }


    public byte[] generateBulkPdf(List<WaybillRecord> records ,String size) throws Exception {

        Document document=createDocument(size);
        ByteArrayOutputStream out=new ByteArrayOutputStream();
        PdfWriter.getInstance(document,out);
        document.open();

        if("LABEL_4X6".equals(size)) {

            for(WaybillRecord record:records){
                document.add(createWaybillBlock(record));
                document.newPage(); 
            }
        } else {

            for(WaybillRecord record:records) {
                document.add(createWaybillBlock(record));
                document.newPage();
            }
        }

        document.close();
        return out.toByteArray();
    }

    
  
    /* ================= ONE WAYBILL COPY ================= */

    @SuppressWarnings("unchecked")
    private PdfPTable createWaybillBlock(
            WaybillRecord record
    ) throws Exception {

              /* ---------- Fonts ---------- */
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

      PdfPTable block = new PdfPTable(1);
        block.setWidthPercentage(100);

        PdfPTable headerTable=new PdfPTable(2);
        headerTable.setWidthPercentage(100);

 /* ---------- Logo ---------- */

        // Image logo=loadLogo();
        // logo.scaleToFit(60, 40);
        // logo.setAlignment(Image.ALIGN_CENTER);

        Image logo = loadLogo();
        if (logo != null) {
            logo.scaleToFit(60, 40);

            PdfPCell logoCell = new PdfPCell(logo);
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setPadding(4);

            headerTable.addCell(logoCell);
        } else {
            // Empty cell to keep layout intact
            PdfPCell empty = new PdfPCell(new Phrase(""));
            empty.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(empty);
        }


        // PdfPCell logoCell = new PdfPCell(logo);
        // logoCell.setBorder(Rectangle.NO_BORDER);
        // logoCell.setPadding(4);
        // headerTable.addCell(logoCell);

        // PdfPCell companyNameCell = new PdfPCell(new Paragraph("Development Talkies", titleFont));
        // companyNameCell.setBorder(Rectangle.NO_BORDER);
        // companyNameCell.setPadding(4);
        // headerTable.addCell(companyNameCell);

        PdfPCell headerCell = new PdfPCell(headerTable);
        headerCell.setBorder(Rectangle.NO_BORDER);
        block.addCell(headerCell);


        /* ---------- Title ---------- */
        PdfPCell titleCell = new PdfPCell(
                new Paragraph("SHIPPING LABEL", titleFont)
        );
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        titleCell.setPadding(4);
        titleCell.setBorder(Rectangle.NO_BORDER);
        block.addCell(titleCell);

        /* ---------- Extract Data ---------- */
        Map<String, Object> root = record.getRequest();
        Map<String, Object> request = (Map<String, Object>) root.get("Request");
        Map<String, Object> shipper = (Map<String, Object>) request.get("Shipper");
        Map<String, Object> consignee = (Map<String, Object>) request.get("Consignee");
        Map<String, Object> services = (Map<String, Object>) request.get("Services");
        Map<String, Object> returnadds = (Map<String, Object>) request.get("Returnadds");
        Map<String, Object> response = record.getResponse();



        System.out.println("\nRoot Request Data: " + request);
        System.out.println("Response Data: " + response);

        /* ---------- Meta ---------- */
        PdfPTable meta = new PdfPTable(2);
        meta.setWidthPercentage(100);
        meta.setWidths(new float[]{1f, 2f});

        // addCell(meta, "OrderType", labelFont);
        // addCell(meta, getOrderType(services).equals("C") ? "COD" : "Prepaid", valueFont);
        addCell(meta, "Order Type", labelFont);
        addCell(meta, getOrderTypeLabel(services), valueFont);

        System.out.println("\nPack Type: " + getPackType(services)+"\n");

        addCell(meta, "Reference", labelFont);
        addCell(meta, record.getCreditReferenceNo(), valueFont);
        addCell(meta, "Pickup Date", labelFont);
        addCell(meta, formatDate(record.getCreatedAt()), valueFont);

        PdfPCell metaCell = new PdfPCell(meta);
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setPadding(2);
        block.addCell(metaCell);

        /* ---------- Shipper / Consignee ---------- */
        PdfPTable party = new PdfPTable(2);
        party.setWidthPercentage(100);

        party.addCell(sectionCell("SHIPPER", sectionFont));
        party.addCell(sectionCell("CONSIGNEE", sectionFont));

        party.addCell(shipperDetailsCell(shipper, valueFont));
        party.addCell(consigneeDetailsCell(consignee, valueFont));

        block.addCell(party);

        /* ---------- Services ---------- */
PdfPTable service = new PdfPTable(1);
service.setWidthPercentage(100);

// Shipment header with routing on the SAME LINE
service.addCell(shipmentHeaderCell(record, sectionFont, valueFont));

// Shipment details below
service.addCell(serviceDetailsCell(services, valueFont));

block.addCell(service);

// COD message (separate row below shipment details)
block.addCell(getCODAmountMessageCell(services, valueFont));
block.addCell(getCollectionMode(services).equals("NA") ? new PdfPCell(new Phrase("", valueFont)) : new PdfPCell(new Phrase("Collection Mode : " + getCollectionMode(services), valueFont)));


        /* ---------- Barcode ---------- */
        Image barcode = barcodeImage(record.getAwbNo());
        barcode.scaleToFit(200, 50);
        barcode.setAlignment(Image.ALIGN_CENTER);

        /*----AWB text below barcode----------*/
        Paragraph awbText = new Paragraph(record.getAwbNo(), valueFont);
        awbText.setAlignment(Element.ALIGN_CENTER);

        PdfPCell barcodeCell = new PdfPCell();
        barcodeCell.setBorder(Rectangle.NO_BORDER);
        barcodeCell.setPadding(4);
        /* Stack barcode + text */
        barcodeCell.addElement(barcode);
        barcodeCell.addElement(awbText);
        block.addCell(barcodeCell);

        
        /* ---------- Return Address ---------- */
        PdfPTable returnAddress = new PdfPTable(1);
        returnAddress.setWidthPercentage(100);
        block.addCell(undeliveredMessageCell(returnadds, valueFont));

        //service.addCell(sectionCell("SHIPMENT DETAILS", sectionFont));
        returnAddress.addCell(returnDetailsCell(returnadds, valueFont));

        block.addCell(returnAddress);

        return block;


    }

    

    /* ================= HELPERS ================= */

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        table.addCell(cell);
    }

    private PdfPCell sectionCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        return cell;
    }

private String getOrderTypeLabel(Map<String, Object> services) {

   
    String productCode = getProductCode(services); // ProductCode
    String subProductCode = getOrderType(services); // SubProductCode
    String packType = getPackType(services); // PackType
    String serviceType="NA";

    if(!productCode.equals("NA") && !subProductCode.equals("NA") && !packType.equals("NA")){
        serviceType = productCode+subProductCode+packType;
    }else if(!productCode.equals("NA") && !subProductCode.equals("NA")){
        serviceType = productCode+subProductCode;
    }else if(!productCode.equals("NA")){
        serviceType = productCode;
    }else{
        serviceType = "";
    }
    

    System.out.println("\nService Type: " + serviceType+"\n");

    if (serviceType == null || serviceType.equals("")) {
        return "";
    }

    switch (serviceType.toUpperCase()) {
        case "ACL":
            return "BHARAT_DART_COD";
        case "APL":
            return "BHARAT_DART_PREPAID";
        case "AC":
            return "ETAIL_APEX_COD";
        case "AP":
            return "ETAIL_APEX_PREPAID";
        case "EC":
            return "ETAIL_SURFACE_COD";
        case "EP":
            return "ETAIL_SURFACE_PREPAID";
        case "AD":
            return "APEX_DOD";
        case "ED":
            return "SURFACE_DOD";
        case "AA":
            return "APEX_FOD";
        case "EA":
            return "SURFACE_FOD";
        case "A":
            return "B2B_APEX";
        case "E":
            return "B2B_SURFACE";
        case "D":
            return "DOMESTIC PRIORITY";             
        default:
            return "";
    }
}

private String getCollectionMode(Map<String, Object> services) {

    String orderType = getOrderType(services);

    // Collection mode NOT applicable for COD or Prepaid
    if ("C".equalsIgnoreCase(orderType)) {
        return "Cash";
    }

    if ("P".equalsIgnoreCase(orderType)) {
        return "NA";
    }

    Object isChequeDD = services.get("IsChequeDD");

    if ("D".equalsIgnoreCase(String.valueOf(isChequeDD))) {
        return "DD";
    } else if ("Q".equalsIgnoreCase(String.valueOf(isChequeDD))) {
        return "Cheque";
    }

    return "NA";
}

    private PdfPCell shipperDetailsCell(Map<String, Object> shipper, Font font) {
    String text =
            safe(shipper, "CustomerName") + "\n" +
            "Mob: " + safe(shipper, "CustomerMobile") + "\n" +
            safe(shipper, "CustomerAddress1") + "\n" +
            safe(shipper, "CustomerAddress2") + "\n" +
            safe(shipper, "CustomerAddress3") + " - " +
            safe(shipper, "CustomerPincode");

    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setPadding(4);
    return cell;
}


    private PdfPCell returnDetailsCell(Map<String, Object> returnadds, Font font) {
    String text =
            safe(returnadds, "ReturnContact") + " "+
            safe(returnadds, "ReturnAddress1") + " " +
            safe(returnadds, "ReturnAddress2") + " " +
            safe(returnadds, "ReturnAddress3") + " - " +
            safe(returnadds, "ReturnPincode") +
            " Mob: " + safe(returnadds, "ReturnMobile") ;

    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setPadding(5);
    return cell;
}

    private PdfPCell consigneeDetailsCell(Map<String, Object> consignee, Font font) {
    String text =
            safe(consignee, "ConsigneeName") + "\n" +
            "Mob: " + safe(consignee, "ConsigneeMobile") + "\n" +
            safe(consignee, "ConsigneeAddress1") + "\n" +
            safe(consignee, "ConsigneeAddress2") + "\n" +
            safe(consignee, "ConsigneeAddress3") + " - " +
            safe(consignee, "ConsigneePincode");

    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setPadding(4);
    return cell;
}



    private PdfPCell serviceDetailsCell(Map<String, Object> services, Font font) {
        String text =
                "Weight: " + safe(services, "ActualWeight") + "\n" +
                "DeclaredValue: " + safe(services, "DeclaredValue") + "\n" +
                "PieceCount: " + safe(services, "PieceCount") + "\n" +
                "ItemName: " + getItemName(services);

        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        return cell;
    }

    private PdfPCell getCODAmountMessageCell(Map<String, Object> services, Font font) {

    String orderType = getOrderType(services);
    double codAmount = parseDoubleSafe(services.get("CollectableAmount"));

    boolean isCOD = "C".equalsIgnoreCase(orderType) && codAmount > 0;
    boolean isDOD = "D".equalsIgnoreCase(orderType) && codAmount > 0;
    boolean isFODDOD = "B".equalsIgnoreCase(orderType) && codAmount > 0;

    if (isCOD || isDOD || isFODDOD) {
        Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            PdfPCell cell = new PdfPCell(new Phrase("Amount to be collected : ₹" + codAmount, fontBold));
    cell.setPadding(4);
    return cell;
        
    }

    return new PdfPCell(new Phrase("", font));


}


private PdfPCell undeliveredMessageCell(Map<String, Object> returnAddress, Font font) {

    Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);

    //String text = "Amount to be collected : ₹" + codAmount;

    PdfPCell cell = new PdfPCell(new Phrase("If undelivered return to :" , fontBold));
    cell.setPadding(4);
    return cell;
}


    private double parseDoubleSafe(Object value) {
    try {
        return value == null ? 0 : Double.parseDouble(value.toString());
    } catch (Exception e) {
        return 0;
    }
}



    @SuppressWarnings("unchecked")
private String getItemName(Map<String, Object> services) {

    Object itemDtlObj = services.get("itemdtl");

    if (!(itemDtlObj instanceof List)) {
        return "NA";
    }

    List<Map<String, Object>> itemList =
            (List<Map<String, Object>>) itemDtlObj;

    if (itemList.isEmpty()) {
        return "NA";
    }

    Object itemName = itemList.get(0).get("ItemName");
    return itemName == null ? "NA" : itemName.toString();
}

private String getOrderType(Map<String, Object> services) {   
    Object subProductCode = services.get("SubProductCode");
    return subProductCode == null ? "NA" : subProductCode.toString(); 
}


private String getPackType(Map<String, Object> services) {   
    Object packType = services.get("PackType");
    return packType == null ? "NA" : packType.toString(); 
}

private String getProductCode(Map<String, Object> services) {   
    Object productCode = services.get("ProductCode");
    return productCode == null ? "NA" : productCode.toString(); 
}



    private Image barcodeImage(String text) throws Exception {
        BitMatrix matrix = new MultiFormatWriter()
                .encode(text, BarcodeFormat.CODE_128, 300, 60);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "png", baos);
        return Image.getInstance(baos.toByteArray());
    }

    private String formatDate(String date) {
        try {
            return LocalDateTime.parse(date).format(OUTPUT_DATE);
        } catch (Exception e) {
            try {
                return LocalDate.parse(date).format(OUTPUT_DATE);
            } catch (Exception ex) {
                return date;
            }
        }
    }

    private String safe(Map<String, Object> map, String key) {
        if (map == null) return "NA";
        Object val = map.get(key);
        return val == null ? "NA" : val.toString();
    }

    // private Image loadLogo() throws Exception {
    //     // Load logo from resources
    //     InputStream is=new ClassPathResource("static/logo.png").getInputStream();
    //     return Image.getInstance(is.readAllBytes());
    // }

    private Image loadLogo() {
    try {
        ClassPathResource resource = new ClassPathResource("static/logo.png");

        if (!resource.exists()) {
            return null;
        }

        InputStream is = resource.getInputStream();
        return Image.getInstance(is.readAllBytes());

    } catch (Exception e) {
        // Log once if needed
        return null;
    }
}


    private Document createDocument(String size) {
        if("LABEL_4X6".equals(size)){
            return new Document(new Rectangle(288f, 432f), 8, 8, 8, 8); // 4x6 inches in points
        } else {
            return new Document(PageSize.A4, 20, 20, 20, 20);
        }
    }

    @SuppressWarnings("unchecked")
private Map<String, Object> getWaybillResult(WaybillRecord record) {
    Object responseObj = record.getResponse();
    if (!(responseObj instanceof Map)) return null;

    Map<String, Object> response = (Map<String, Object>) responseObj;
    Object resultObj = response.get("GenerateWayBillResult");

    if (!(resultObj instanceof Map)) return null;
    return (Map<String, Object>) resultObj;
}

private String getClusterCode(WaybillRecord record) {
    Map<String, Object> result = getWaybillResult(record);
    return result == null ? "NA" : safe(result, "ClusterCode");
}

private String getDestinationArea(WaybillRecord record) {
    Map<String, Object> result = getWaybillResult(record);
    return result == null ? "NA" : safe(result, "DestinationArea");
}

private String getDestinationCode(WaybillRecord record) {
    Map<String, Object> result = getWaybillResult(record);
    return result == null ? "NA" : safe(result, "DestinationLocation");
}


private String getRoutingText(WaybillRecord record) {

    String area = normalize(getDestinationArea(record));
    String destCode = normalize(getDestinationCode(record));
    String cluster = normalize(getClusterCode(record));

    StringBuilder route = new StringBuilder();

    if (!area.isEmpty()) {
        route.append(area);
    }

    if (!destCode.isEmpty()) {
        if (route.length() > 0) route.append(" / ");
        route.append(destCode);
    }

    if (!cluster.isEmpty()) {
        if (route.length() > 0) route.append(" / ");
        route.append(cluster);
    }

    return route.toString();
}

private String normalize(String value) {
    if (value == null) return "";
    value = value.trim();
    return value.equalsIgnoreCase("NA") ? "" : value;
}

private PdfPCell shipmentHeaderCell(
        WaybillRecord record,
        Font sectionFont,
        Font valueFont
) throws DocumentException {
    PdfPTable header = new PdfPTable(2);
    header.setWidthPercentage(100);
    header.setWidths(new float[]{3f, 2f});

    // LEFT: SHIPMENT DETAILS
    PdfPCell left = new PdfPCell(new Phrase("SHIPMENT DETAILS", sectionFont));
    left.setBorder(Rectangle.NO_BORDER);
    left.setPadding(4);
    left.setHorizontalAlignment(Element.ALIGN_LEFT);

    // RIGHT: Routing codes
    String routingText = getRoutingText(record);

    System.out.println("\n\nRouting Text: " + routingText+"\n\n");
    

    PdfPCell right = new PdfPCell(new Phrase(routingText, valueFont));
    right.setBorder(Rectangle.NO_BORDER);
    right.setPadding(4);
    right.setHorizontalAlignment(Element.ALIGN_RIGHT);

    header.addCell(left);
    header.addCell(right);

    // Wrap header row with gray background
    PdfPCell wrapper = new PdfPCell(header);
    wrapper.setBackgroundColor(BaseColor.LIGHT_GRAY);
    wrapper.setPadding(0);
    return wrapper;
}

}
