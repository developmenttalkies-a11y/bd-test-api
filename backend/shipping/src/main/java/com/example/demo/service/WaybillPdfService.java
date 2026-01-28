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

        Image logo=loadLogo();
        logo.scaleToFit(60, 40);
        logo.setAlignment(Image.ALIGN_CENTER);

        PdfPCell logoCell = new PdfPCell(logo);
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setPadding(4);
        headerTable.addCell(logoCell);

        PdfPCell companyNameCell = new PdfPCell(new Paragraph("Development Talkies", titleFont));
        companyNameCell.setBorder(Rectangle.NO_BORDER);
        companyNameCell.setPadding(4);
        headerTable.addCell(companyNameCell);

        PdfPCell headerCell = new PdfPCell(headerTable);
        headerCell.setBorder(Rectangle.NO_BORDER);
        block.addCell(headerCell);


        /* ---------- Title ---------- */
        PdfPCell titleCell = new PdfPCell(
                new Paragraph("SHIPPING WAYBILL", titleFont)
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

        /* ---------- Meta ---------- */
        PdfPTable meta = new PdfPTable(2);
        meta.setWidthPercentage(100);
        meta.setWidths(new float[]{1f, 2f});

        addCell(meta, "OrderType", labelFont);
        addCell(meta, getOrderType(services).equals("C") ? "COD" : "Prepaid", valueFont);
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

        service.addCell(sectionCell("SHIPMENT DETAILS", sectionFont));
        service.addCell(serviceDetailsCell(services, valueFont));

        block.addCell(service);

        block.addCell(getCODAmountMessageCell(services, valueFont));


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

    if (!isCOD) {
        return new PdfPCell(new Phrase("", font));
    }

    Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);

    //String text = "Amount to be collected : ₹" + codAmount;

    PdfPCell cell = new PdfPCell(new Phrase("Amount to be collected : ₹" + codAmount, fontBold));
    cell.setPadding(4);
    return cell;
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

    private Image loadLogo() throws Exception {
        // Load logo from resources
        InputStream is=new ClassPathResource("static/logo.png").getInputStream();
        return Image.getInstance(is.readAllBytes());
    }

    private Document createDocument(String size) {
        if("LABEL_4X6".equals(size)){
            return new Document(new Rectangle(288f, 432f), 8, 8, 8, 8); // 4x6 inches in points
        } else {
            return new Document(PageSize.A4, 20, 20, 20, 20);
        }
    }
}
