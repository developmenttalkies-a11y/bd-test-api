package com.example.demo.service;
import java.io.File;
import java.io.IOException;
import com.example.demo.dto.ShipperProfilePayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.nio.file.Path;
import java.nio.file.Paths;


@Service
public class ShipperProfileFileService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final Path filePath;

    public ShipperProfileFileService() {
        this.filePath = Paths.get(System.getProperty("user.dir"))
                .resolve("data")
                .resolve("shipper-profile.json");
    }

    public ShipperProfilePayload load() throws IOException {
        File file = filePath.toFile();

        System.out.println("Looking for file at: " + file.getAbsolutePath());

        if (!file.exists() || file.length() == 0) {
            return null;
        }

        return mapper.readValue(file, ShipperProfilePayload.class);
    }

    public void save(ShipperProfilePayload payload) throws IOException {
        File file = filePath.toFile();
        file.getParentFile().mkdirs();
        mapper.writerWithDefaultPrettyPrinter().writeValue(file, payload);
    }
}
