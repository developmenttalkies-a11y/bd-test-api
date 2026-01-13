package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.CancelWaybillRequest;
import com.example.demo.dto.CancelWaybillResponse;



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
    private String baseUrl="https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/CancelWaybill";

    public WaybillCancellationService(BluedartAuthService bluedartAuthService) {
        this.bluedartAuthService = bluedartAuthService;
        this.restTemplate = new RestTemplate();
    }

    String getJwtToken() {
        return bluedartAuthService.getJwtToken();
    }

    public CancelWaybillResponse cancelWaybill(String awbNo) {

    CancelWaybillRequest request=new CancelWaybillRequest();
    CancelWaybillRequest.Request req=new CancelWaybillRequest.Request();
    req.setAwbNo(awbNo);

    CancelWaybillRequest.Profile profile=new CancelWaybillRequest.Profile();
    profile.setApiType("S");
    profile.setLicenceKey(licenceKey);
    profile.setLoginId(loginId);

    request.setRequest(req);
    request.setProfile(profile);

    String jwtToken = getJwtToken();
    System.out.println("JWT = " + jwtToken);

    System.out.println("Request : "+request);

    HttpHeaders headers = new HttpHeaders();
    headers.set("JWTToken", jwtToken);



    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<CancelWaybillRequest> entity =
            new HttpEntity<>(request, headers);
    ResponseEntity<CancelWaybillResponse> response = restTemplate.exchange(
            baseUrl, HttpMethod.POST, entity, CancelWaybillResponse.class); 

    return response.getBody();  
    }
    
    

}
