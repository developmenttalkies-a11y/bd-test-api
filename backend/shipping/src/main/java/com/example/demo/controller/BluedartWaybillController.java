package com.example.demo.controller;

import com.example.demo.repository.WaybillFileRepository;
import com.example.demo.service.BluedartWaybillService;
import com.example.demo.service.BulkWaybillExcelService;
import com.example.demo.service.BulkWaybillTemplateService;
import com.example.demo.service.BulkWaybillFileParser;
import org.springframework.web.multipart.MultipartFile; 
import com.example.demo.dto.BulkWaybillResult;
import com.example.demo.dto.CancelWaybillResponse;

import org.springframework.web.bind.annotation.*;
import com.example.demo.model.WaybillRecord;
import com.example.demo.service.WaybillPdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.example.demo.service.WaybillCancellationService;


import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/bluedart")
@CrossOrigin(origins = "*")
public class BluedartWaybillController {

    private final BluedartWaybillService waybillService;
    private final WaybillFileRepository repository;
    private final WaybillPdfService pdfService;
    private final BulkWaybillTemplateService templateService;   
    private final BulkWaybillFileParser bulkFileParser;
    private final BulkWaybillExcelService excelService;
    private final WaybillCancellationService cancellationService;
    
    public BluedartWaybillController(BluedartWaybillService waybillService, WaybillFileRepository repository, 
        WaybillPdfService pdfService,BulkWaybillTemplateService  templateService, BulkWaybillFileParser bulkFileParser, BulkWaybillExcelService excelService, WaybillCancellationService cancellationService) {
        this.waybillService = waybillService;
        this.repository = repository;
        this.pdfService = pdfService;
        this.templateService=templateService;
        this.bulkFileParser=bulkFileParser;
        this.excelService=excelService;
        this.cancellationService=cancellationService;
    }

    @PostMapping("/waybill")
public Map<String, Object> createWaybill(@RequestBody Map<String, Object> request) {

    System.out.println("✅ Backend received waybill request");
    System.out.println(request);

    return waybillService.generateWaybill(request);
}

    @GetMapping("/waybills")
    public List<WaybillRecord> getAllWaybills() {
        return repository.findAll();
    }


    @GetMapping("/waybill/{awb}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String awb, @RequestParam(defaultValue = "A4") String size) throws Exception {

        WaybillRecord record = repository.findByAwbNo(awb);
if (record == null) {
    throw new RuntimeException("Waybill not found");
}

        byte[] pdf = pdfService.generatePdf(record, size);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=waybill-" + awb + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }


    @PostMapping("/waybill/bulk")    
    public ResponseEntity<Map<String,Object>> uploadBulkWaybill(
        @RequestParam("file") MultipartFile file,
        @RequestParam(defaultValue="A4") String size
    ) throws Exception {
        List<Map<String,Object>> requests=bulkFileParser.parse(file);
        //List<WaybillRecord> records=waybillService.generateBulkWaybills(requests);
        BulkWaybillResult result=waybillService.generateBulkWaybills(requests);

        if(!result.getSuccessRecords().isEmpty()){
            byte[] pdf=pdfService.generateBulkPdf(result.getSuccessRecords(), size);
            Files.write(Path.of("data/bulk.pdf"), pdf);
        }

        Files.write(Path.of("data/success.xlsx"),excelService.generateSuccessExcel(result.getSuccessRecords()));

        Files.write(Path.of("data/failure.xlsx"),excelService.generateFailureExcel(result.getFailures()));

        Map<String,Object> response=new HashMap<>();
        response.put("total", result.getTotal());
        response.put("success", result.getSuccess());
        response.put("failed",result.getFailed());
        return ResponseEntity.ok(response);
    }


@GetMapping("/waybill/bulk/template")
public ResponseEntity<byte[]> downloadTemplate() throws Exception {

    byte[] file = templateService.generateTemplate();

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=Bluedart_Bulk_Waybill_Template.xlsx")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(file);
}

@GetMapping("/waybill/cancel/template")
public ResponseEntity<byte[]> downloadCancelTemplate() throws Exception {

    byte[] file = templateService.generateCancelTemplate();

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=Bluedart_Bulk_Cancel_Template.xlsx")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(file);
}

@GetMapping("/waybill/bulk/success")
public ResponseEntity<byte[]> downloadSuccessExcel() throws Exception {
     return fileResponse("success.xlsx");
}

@GetMapping("/waybill/bulk/failure")
public ResponseEntity<byte[]> downloadFailureExcel() throws Exception {
    return fileResponse("failure.xlsx");
}

@GetMapping("/waybill/bulk/pdf")
public ResponseEntity<byte[]> downloadPdfBulk() throws Exception {
    return fileResponse("bulk.pdf");
}

private ResponseEntity<byte[]> fileResponse(String name) throws Exception {

    byte[] data=Files.readAllBytes(Path.of("data/"+name));
    return ResponseEntity.ok()
    .header(HttpHeaders.CONTENT_DISPOSITION,"attachment;filename="+name)
    .body(data);
}

@PostMapping("/cancel")
public ResponseEntity<?> cancelWaybill(@RequestParam String awbNo) {
    System.out.println("✅ Backend received cancel waybill request for AWB No: " + awbNo);

    CancelWaybillResponse response = cancellationService.cancelWaybill(awbNo);
    return ResponseEntity.ok(response);
}

}