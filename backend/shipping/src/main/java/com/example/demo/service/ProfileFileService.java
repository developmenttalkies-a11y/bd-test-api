package com.example.demo.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.example.demo.dto.ShipperProfile;

import java.io.File;
import java.io.IOException;

@Service
public class ProfileFileService {

    private static final String FILE_PATH = "data/shipper-profile.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void saveProfile(ShipperProfile profile) throws IOException {
        File file = new File(FILE_PATH);
        file.getParentFile().mkdirs(); // ensure data/ exists
        objectMapper.writerWithDefaultPrettyPrinter()
                .writeValue(file, profile);
    }

    public ShipperProfile getProfile() throws IOException {
        File file = new File(FILE_PATH);

        if (!file.exists()) {
            return null;
        }
        return objectMapper.readValue(file, ShipperProfile.class);
    }
}
