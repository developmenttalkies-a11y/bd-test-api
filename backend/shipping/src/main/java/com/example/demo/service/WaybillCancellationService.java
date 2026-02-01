package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.CancelHistoryRecord;
import com.example.demo.dto.CancelWaybillRequest;
import com.example.demo.dto.CancelWaybillResponse;
import java.util.Collections;
import org.springframework.web.client.HttpClientErrorException;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;



@Service
public class WaybillCancellationService {   

    @Value("${bluedart.cancel-url}")
    private String cancelUrl;

    @Value("${bluedart.licence-key}")
    private String licenceKey;

    @Value("${bluedart.login-id}")
    private String loginId;

    private final BluedartAuthService bluedartAuthService;
    private final RestTemplate restTemplate;
    private CancelHistoryFileService historyService;
    //private String baseUrl="https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/CancelWaybill";

    public WaybillCancellationService(BluedartAuthService bluedartAuthService,CancelHistoryFileService historyService) {
        this.bluedartAuthService = bluedartAuthService;
        this.historyService=historyService;
        this.restTemplate = new RestTemplate();
    }

    String getJwtToken() {
        return bluedartAuthService.getJwtToken();
    }

//     public CancelWaybillResponse cancelWaybill(String awbNo) {

//     CancelWaybillRequest request=new CancelWaybillRequest();
//     CancelWaybillRequest.Request req=new CancelWaybillRequest.Request();
//     req.setAwbNo(awbNo);

//     CancelWaybillRequest.Profile profile=new CancelWaybillRequest.Profile();
//     profile.setApiType("S");
//     profile.setLicenceKey(licenceKey);
//     profile.setLoginId(loginId);

//     request.setRequest(req);
//     request.setProfile(profile);

//     String jwtToken = getJwtToken();
//     System.out.println("JWT = " + jwtToken);

//     System.out.println("Request : "+request);

//     HttpHeaders headers = new HttpHeaders();
//     headers.set("JWTToken", jwtToken);

//     headers.setContentType(MediaType.APPLICATION_JSON);
//     HttpEntity<CancelWaybillRequest> entity =
//             new HttpEntity<>(request, headers);
//      try {       
//     ResponseEntity<CancelWaybillResponse> response = restTemplate.exchange(
//             cancelUrl, HttpMethod.POST, entity, CancelWaybillResponse.class); 

//     CancelWaybillResponse body= response.getBody();  

//     boolean IsError=body.getCancelWaybillResult().getIsError();
//     String message=body.getCancelWaybillResult().getStatus().get(0).getStatusInformation(); 

//     historyService.save(
//         new CancelHistoryRecord(awbNo,IsError?"Failed":"Success",
//             message,
//             LocalDateTime.now(),
//             "SINGLE",
//             "SYSTEM"
//         )
//     );

//     return body;
        
//     } catch(Exception ex) {

//         historyService.save(
//             new CancelHistoryRecord(
//                 awbNo,
//                 "Failed",
//                 ex.getMessage(),
//                 LocalDateTime.now(),
//                 "SINGLE",
//                 "SYSTEM"
//             )
//         );

//         throw ex;
//     }  
// }

// public CancelWaybillResponse cancelWaybillInternal(String awbNo) {

//     CancelWaybillRequest request=new CancelWaybillRequest();
//     CancelWaybillRequest.Request req=new CancelWaybillRequest.Request();
//     req.setAwbNo(awbNo);

//     CancelWaybillRequest.Profile profile=new CancelWaybillRequest.Profile();
//     profile.setApiType("S");
//     profile.setLicenceKey(licenceKey);
//     profile.setLoginId(loginId);

//     request.setRequest(req);
//     request.setProfile(profile);

//     String jwtToken = getJwtToken();
//     System.out.println("JWT = " + jwtToken);

//     System.out.println("Request : "+request);

//     HttpHeaders headers = new HttpHeaders();
//     headers.set("JWTToken", jwtToken);

//     headers.setContentType(MediaType.APPLICATION_JSON);
//     headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
//     HttpEntity<CancelWaybillRequest> entity =
//             new HttpEntity<>(request, headers);
           
//     ResponseEntity<CancelWaybillResponse> response = restTemplate.exchange(
//             cancelUrl, HttpMethod.POST, entity, CancelWaybillResponse.class); 


//           return response.getBody();
// }


public CancelWaybillResponse cancelWaybillInternal(String awb) {

    CancelWaybillRequest request = new CancelWaybillRequest();

    CancelWaybillRequest.Request req = new CancelWaybillRequest.Request();
    req.setAwbNo(awb);

    CancelWaybillRequest.Profile profile = new CancelWaybillRequest.Profile();
    profile.setApiType("S");
    profile.setLicenceKey(licenceKey);
    profile.setLoginId(loginId);

    request.setRequest(req);
    request.setProfile(profile);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
    headers.set("JWTToken", getJwtToken());

    HttpEntity<CancelWaybillRequest> entity =
            new HttpEntity<>(request, headers);

    try {
        // ✅ Success case (HTTP 200)
        ResponseEntity<CancelWaybillResponse> response =
                restTemplate.exchange(
                        cancelUrl,
                        HttpMethod.POST,
                        entity,
                        CancelWaybillResponse.class
                );

        return response.getBody();

    } catch (HttpClientErrorException ex) {
        // ✅ Error case (HTTP 400)
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(ex.getResponseBodyAsString());

            JsonNode errorNode = root
                    .path("error-response")
                    .get(0);

            String message = errorNode
                    .path("Status")
                    .get(0)
                    .path("StatusInformation")
                    .asText("Cancellation failed");

            // 🔹 Build normalized response
            CancelWaybillResponse response = new CancelWaybillResponse();
            CancelWaybillResponse.CancelWaybillResult result =
                    new CancelWaybillResponse.CancelWaybillResult();

            result.setAwbNo(awb);
            result.setIsError(true);

            CancelWaybillResponse.Status status =
                    new CancelWaybillResponse.Status();
            status.setStatusCode("CancelFailure");
            status.setStatusInformation(message);

            result.setStatus(List.of(status));
            response.setCancelWaybillResult(result);

            return response;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to parse Blue Dart error response", e
            );
        }
    }
}


}
