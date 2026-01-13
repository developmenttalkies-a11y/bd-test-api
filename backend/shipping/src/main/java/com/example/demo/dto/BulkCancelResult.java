package com.example.demo.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkCancelResult {
    private String awbNo;
    private String status;
    private String message;
}

