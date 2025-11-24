package com.midpoint.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.midpoint.dto.PlaceDetails;
import com.midpoint.dto.PlacePrediction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleMapsServiceTest1 {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec<?> requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec<?> requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private GoogleMapsService googleMapsService;

    private final String apiKey = "test-api-key";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(googleMapsService, "apiKey", apiKey);
        ReflectionTestUtils.setField(googleMapsService, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(googleMapsService, "webClient", webClient);
    }

    @Test
    void testGetPlaceAutocomplete_Success() {
        String input = "New York";
        String session = "sess-123";
        String mockResponse = """
            {
              "predictions": [
                {
                  "place_id": "pid-1",
                  "description": "Place One, New York, NY",
                  "structured_formatting": {
                    "main_text": "Place One",
                    "secondary_text": "New York, NY"
                  }
                },
                {
                  "place_id": "pid-2",
                  "description": "Place Two, Brooklyn, NY",
                  "structured_formatting": {
                    "main_text": "Place Two"
                  }
                }
              ],
              "status": "OK"
            }
            """;

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete(input, session);

        StepVerifier.create(mono)
            .assertNext(predictions -> {
                assertEquals(2, predictions.size());

                PlacePrediction p1 = predictions.get(0);
                assertEquals("pid-1", p1.getPlaceId());
                assertEquals("Place One, New York, NY", p1.getDescription());
                assertNotNull(p1.getStructuredFormatting());
                assertEquals("Place One", p1.getStructuredFormatting().getMainText());
                assertEquals("New York, NY", p1.getStructuredFormatting().getSecondaryText());

                PlacePrediction p2 = predictions.get(1);
                assertEquals("pid-2", p2.getPlaceId());
                assertEquals("Place Two, Brooklyn, NY", p2.getDescription());
                assertNotNull(p2.getStructuredFormatting());
                assertEquals("Place Two", p2.getStructuredFormatting().getMainText());
                assertNull(p2.getStructuredFormatting().getSecondaryText());
            })
            .verifyComplete();

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestHeadersUriSpec).uri(urlCaptor.capture());
        assertTrue(urlCaptor.getValue().contains("input=New%20York"));
        assertTrue(urlCaptor.getValue().contains("sessiontoken=" + session));
        assertTrue(urlCaptor.getValue().contains("key=" + apiKey));
    }

    @Test
    void testGetPlaceAutocomplete_EmptyResults() {
        String input = "Nowhere";
        String session = "sess-123";
        String mockResponse = "{\"predictions\":[],\"status\":\"OK\"}";

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        Mono<List<PlacePrediction>> mono = googleMapsService.getPlaceAutocomplete(input, session);

        StepVerifier.create(mono)
            .assertNext(list -> assertTrue(list.isEmpty()))
            .verifyComplete();
    }


}
