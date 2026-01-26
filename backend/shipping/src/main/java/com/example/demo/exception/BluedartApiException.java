package com.example.demo.exception;

public class BluedartApiException extends RuntimeException {

    private final String rawResponse;
    private final String userMessage;

    public BluedartApiException(String userMessage, String rawResponse) {
        super(userMessage);
        this.userMessage = userMessage;
        this.rawResponse = rawResponse;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public String getRawResponse() {
        return rawResponse;
    }
}

