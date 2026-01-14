package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.BulkCancelResponse;
import com.example.demo.dto.BulkCancelResult;
import com.example.demo.dto.CancelWaybillResponse;
import com.example.demo.dto.CancelHistoryRecord;

@Service
public class BulkCancelService {

    private final WaybillCancellationService waybillCancellationService;
    private final CancelHistoryFileService historyService;

    public BulkCancelService(
            WaybillCancellationService waybillCancellationService,
            CancelHistoryFileService historyService) {

        this.waybillCancellationService = waybillCancellationService;
        this.historyService = historyService;
    }

    public BulkCancelResponse processExcel(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        List<BulkCancelResult> results = new ArrayList<>();
        int success = 0;
        int failed = 0;

        try (Workbook workbook =
                     WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            DataFormatter formatter = new DataFormatter(); // added

            // Start from row 1 (skip header row)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                Cell cell = row.getCell(0);
                if (cell == null) {
                    continue;
                }
        String awbNo = formatter.formatCellValue(cell).trim();  // changed

                if (awbNo.isEmpty()) {
                    continue;
                }

                try {
                    // 🔹 Call existing single-cancel logic
                    CancelWaybillResponse response =
                            waybillCancellationService.cancelWaybill(awbNo);

                    boolean isError =
                            response.getCancelWaybillResult().getIsError();

                    String message =
                            response.getCancelWaybillResult()
                                    .getStatus()
                                    .get(0)
                                    .getStatusInformation();

                    if (!isError) {
                        success++;
                        results.add(
                                new BulkCancelResult(awbNo, "SUCCESS", message)
                        );
                    } else {
                        failed++;
                        results.add(
                                new BulkCancelResult(awbNo, "FAILED", message)
                        );
                    }

                    // 🔹 Save history (SUCCESS / FAILED from API)
                    historyService.save(
                            new CancelHistoryRecord(
                                    awbNo,
                                    isError ? "FAILED" : "SUCCESS",
                                    message,
                                    LocalDateTime.now(),
                                    "BULK",
                                    "SYSTEM"
                            )
                    );

                } catch (Exception ex) {
                    failed++;

                    results.add(
                            new BulkCancelResult(
                                    awbNo,
                                    "FAILED",
                                    ex.getMessage()
                            )
                    );

                    // 🔹 Save history (EXCEPTION case)
                    historyService.save(
                            new CancelHistoryRecord(
                                    awbNo,
                                    "FAILED",
                                    ex.getMessage(),
                                    LocalDateTime.now(),
                                    "BULK",
                                    "SYSTEM"
                            )
                    );
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Invalid or unreadable Excel file", e);
        }

        return new BulkCancelResponse(
                results.size(),
                success,
                failed,
                results
        );
    }
}
