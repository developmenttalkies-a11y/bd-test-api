package com.example.demo.dto;

import org.springframework.stereotype.Component;

@Component
public class ProfileStore {

    private ShipperProfile profile;

    public ShipperProfile getProfile() {
        return profile;
    }

    public void saveProfile(ShipperProfile profile) {
        this.profile = profile;
    }
}

