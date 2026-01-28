package com.example.demo.controller;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.ShipperProfilePayload;
import com.example.demo.service.ShipperProfileFileService;


@RestController
@RequestMapping("/api/shipper-profile")
@CrossOrigin("*")
public class ShipperProfileController {

    private final ShipperProfileFileService service;

    public ShipperProfileController(ShipperProfileFileService service) {
        this.service = service;
    }

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<?> getProfile() {
    System.out.println("Fetching shipper profile");

    try {
        ShipperProfilePayload data = service.load();
        System.out.println("Loaded data: " + data);

        if (data == null) {
            return ResponseEntity.ok(Map.of(
                "shipper", Map.of(),
                "profile", null
            ));
        }

        return ResponseEntity.ok(data);

    } catch (Exception e) {
        e.printStackTrace(); // 🔥 THIS will show the real problem
        return ResponseEntity
                .status(500)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
    }
}



    @PostMapping
    public void saveProfile(@RequestBody ShipperProfilePayload payload)
            throws Exception {
        service.save(payload);
    }
}

