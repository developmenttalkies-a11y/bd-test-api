package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ShipperProfile {
    private String customerCode;
    private String originArea;
    private String shipperName;
    private String shipperAddress1;
    private String shipperAddress2;
    private String shipperAddress3;
    private String shipperPincode;
    private String shipperMobile;
    private String shipperTelephone;
    private Profile profile;

}
