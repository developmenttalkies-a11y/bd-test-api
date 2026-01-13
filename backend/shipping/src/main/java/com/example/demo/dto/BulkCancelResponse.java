package com.example.demo.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkCancelResponse {
    private int total;
    private int success;
    private int failed;
    private List<BulkCancelResult> results;
}
