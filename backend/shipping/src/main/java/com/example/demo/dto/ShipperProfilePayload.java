package com.example.demo.dto;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ShipperProfilePayload {
        private Map<String, Object> shipper;
    private Map<String, Object> profile;
}
