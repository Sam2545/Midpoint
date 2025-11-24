package com.midpoint.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MidpointServiceTest2 {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec<WebClient.RequestBodySpec> requestHeadersUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private MidpointService midpointService;

    private ObjectMapper objectMapper;
    private String apiKey = "test-api-key";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        ReflectionTestUtils.setField(midpointService, "apiKey", apiKey);
        ReflectionTestUtils.setField(midpointService, "objectMapper", objectMapper);
        ReflectionTestUtils.setField(midpointService, "webClient", webClient);
    }


    @Test
    void testReverseGeocode_InvalidResponse() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        String mockResponse = "{\"status\":\"ZERO_RESULTS\"}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<String> result = midpointService.reverseGeocode(coordinates);
        
        StepVerifier.create(result)
            .expectNextMatches(address -> address.contains("40.7128") && address.contains("-74.0060"))
            .verifyComplete();
    }

    @Test
    void testGetPhotoUrl() {
        String photoReference = "test-photo-ref";
        int maxWidth = 400;
        
        String url = midpointService.getPhotoUrl(photoReference, maxWidth);
        
        assertNotNull(url);
        assertTrue(url.contains(photoReference));
        assertTrue(url.contains(String.valueOf(maxWidth)));
        assertTrue(url.contains(apiKey));
    }

    @Test
    void testSearchPlaces_Success() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = Arrays.asList("restaurant");
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[{" +
            "\"place_id\":\"test-id\"," +
            "\"name\":\"Test Restaurant\"," +
            "\"vicinity\":\"123 Main St\"," +
            "\"rating\":4.5," +
            "\"user_ratings_total\":100," +
            "\"price_level\":2," +
            "\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}," +
            "\"types\":[\"restaurant\",\"food\"]" +
            "}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> {
                assertEquals(1, places.size());
                Place place = places.get(0);
                assertEquals("test-id", place.getPlaceId());
                assertEquals("Test Restaurant", place.getName());
                assertEquals("123 Main St", place.getAddress());
                assertEquals(4.5, place.getRating());
                assertEquals(100, place.getUserRatingsTotal());
                assertEquals(2, place.getPriceLevel());
                assertNotNull(place.getCoordinates());
                assertNotNull(place.getDistance());
            })
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_WithPhotos() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[{" +
            "\"place_id\":\"test-id\"," +
            "\"name\":\"Test Restaurant\"," +
            "\"formatted_address\":\"123 Main St\"," +
            "\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}," +
            "\"photos\":[{" +
            "\"photo_reference\":\"photo-ref\"," +
            "\"height\":400," +
            "\"width\":400" +
            "}]" +
            "}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> {
                assertEquals(1, places.size());
                Place place = places.get(0);
                assertNotNull(place.getPhotos());
                assertEquals(1, place.getPhotos().size());
                Place.Photo photo = place.getPhotos().get(0);
                assertEquals("photo-ref", photo.getPhotoReference());
                assertEquals(400, photo.getHeight());
                assertEquals(400, photo.getWidth());
                assertNotNull(photo.getUrl());
            })
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_APIError() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"INVALID_REQUEST\"}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> assertEquals(0, places.size()))
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_Error() {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.error(new RuntimeException("Network error")));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> assertEquals(0, places.size()))
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_EmptyPlaces() {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = new ArrayList<>();
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> assertEquals(0, resultPlaces.size()))
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_EmptyOrigins() {
        List<Coordinates> origins = new ArrayList<>();
        List<Place> places = Arrays.asList(createTestPlace());
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> assertEquals(1, resultPlaces.size()))
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_Success() throws Exception {
        List<Coordinates> origins = Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        );
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"OK\",\"rows\":[" +
            "{\"elements\":[{\"status\":\"OK\",\"distance\":{\"value\":1000,\"text\":\"1 km\"},\"duration\":{\"value\":300,\"text\":\"5 mins\"}}]}," +
            "{\"elements\":[{\"status\":\"OK\",\"distance\":{\"value\":2000,\"text\":\"2 km\"},\"duration\":{\"value\":600,\"text\":\"10 mins\"}}]}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> {
                assertEquals(1, resultPlaces.size());
                Place place = resultPlaces.get(0);
                assertNotNull(place.getTravelSummaries());
                assertEquals(2, place.getTravelSummaries().size());
                
                Place.TravelSummary summary1 = place.getTravelSummaries().get(0);
                assertEquals(0, summary1.getOriginIndex());
                assertEquals(1000, summary1.getDistanceMeters());
                assertEquals("1 km", summary1.getDistanceText());
                assertEquals(300, summary1.getDurationSeconds());
                assertEquals("5 mins", summary1.getDurationText());
                
                Place.TravelSummary summary2 = place.getTravelSummaries().get(1);
                assertEquals(1, summary2.getOriginIndex());
                assertEquals(2000, summary2.getDistanceMeters());
            })
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_NonOKStatus() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"INVALID_REQUEST\"}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> assertEquals(1, resultPlaces.size()))
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_ElementError() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"OK\",\"rows\":[" +
            "{\"elements\":[{\"status\":\"NOT_FOUND\"}]}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> {
                assertEquals(1, resultPlaces.size());
                Place place = resultPlaces.get(0);
                assertNotNull(place.getTravelSummaries());
                assertEquals(1, place.getTravelSummaries().size());
                assertNull(place.getTravelSummaries().get(0).getDistanceMeters());
            })
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_Error() {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.error(new RuntimeException("Network error")));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> assertEquals(1, resultPlaces.size()))
            .verifyComplete();
    }

    @Test
    void testFindMidpointAndPlaces_Success() throws Exception {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(Arrays.asList("restaurant"));
        
        String geocodeResponse = "{\"status\":\"OK\",\"results\":[{\"formatted_address\":\"New York, NY, USA\"}]}";
        String placesResponse = "{\"status\":\"OK\",\"results\":[{" +
            "\"place_id\":\"test-id\"," +
            "\"name\":\"Test Restaurant\"," +
            "\"vicinity\":\"123 Main St\"," +
            "\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}" +
            "}]}";
        String distanceMatrixResponse = "{\"status\":\"OK\",\"rows\":[" +
            "{\"elements\":[{\"status\":\"OK\",\"distance\":{\"value\":1000,\"text\":\"1 km\"},\"duration\":{\"value\":300,\"text\":\"5 mins\"}}]}," +
            "{\"elements\":[{\"status\":\"OK\",\"distance\":{\"value\":2000,\"text\":\"2 km\"},\"duration\":{\"value\":600,\"text\":\"10 mins\"}}]}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.just(geocodeResponse))
            .thenReturn(Mono.just(placesResponse))
            .thenReturn(Mono.just(distanceMatrixResponse));
        
        Mono<MidpointResponse> result = midpointService.findMidpointAndPlaces(request);
        
        StepVerifier.create(result)
            .assertNext(response -> {
                assertNotNull(response.getMidpoint());
                assertEquals("New York, NY, USA", response.getMidpointAddress());
                assertNotNull(response.getPlaces());
                assertEquals(1, response.getPlaces().size());
                assertNotNull(response.getRadiusMeters());
            })
            .verifyComplete();
    }

    @Test
    void testFindMidpointAndPlaces_WithCorrection() throws Exception {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(new ArrayList<>());
        
        String geocodeResponse = "{\"status\":\"OK\",\"results\":[{\"formatted_address\":\"New York, NY, USA\"}]}";
        String placesResponse = "{\"status\":\"OK\",\"results\":[]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.just(geocodeResponse))
            .thenReturn(Mono.just(placesResponse));
        
        Mono<MidpointResponse> result = midpointService.findMidpointAndPlaces(request);
        
        StepVerifier.create(result)
            .assertNext(response -> {
                assertNotNull(response.getMidpoint());
                assertNotNull(response.getPlaces());
            })
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_MissingDistance() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"OK\",\"rows\":[" +
            "{\"elements\":[{\"status\":\"OK\",\"duration\":{\"value\":300,\"text\":\"5 mins\"}}]}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> {
                assertEquals(1, resultPlaces.size());
                Place place = resultPlaces.get(0);
                assertNotNull(place.getTravelSummaries());
                assertEquals(1, place.getTravelSummaries().size());
                assertNull(place.getTravelSummaries().get(0).getDistanceMeters());
                assertNotNull(place.getTravelSummaries().get(0).getDurationSeconds());
            })
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_MissingDuration() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"OK\",\"rows\":[" +
            "{\"elements\":[{\"status\":\"OK\",\"distance\":{\"value\":1000,\"text\":\"1 km\"}}]}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> {
                assertEquals(1, resultPlaces.size());
                Place place = resultPlaces.get(0);
                assertNotNull(place.getTravelSummaries());
                assertEquals(1, place.getTravelSummaries().size());
                assertNotNull(place.getTravelSummaries().get(0).getDistanceMeters());
                assertNull(place.getTravelSummaries().get(0).getDurationSeconds());
            })
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_MultiplePlaces() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(
            createTestPlace(),
            createTestPlace2()
        );
        
        String mockResponse = """
            {"status":"OK","rows":[
                {"elements":[
                    {"status":"OK","distance":{"value":1000,"text":"1 km"},"duration":{"value":300,"text":"5 mins"}},
                    {"status":"OK","distance":{"value":2000,"text":"2 km"},"duration":{"value":600,"text":"10 mins"}}
                ]}
            ]}
            """;
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> {
                assertEquals(2, resultPlaces.size());
                for (Place place : resultPlaces) {
                    assertNotNull(place.getTravelSummaries());
                    assertEquals(1, place.getTravelSummaries().size());
                }
            })
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_MissingRows() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"OK\"}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> assertEquals(1, resultPlaces.size()))
            .verifyComplete();
    }

    @Test
    void testComputeTravelSummaries_ParsingError() throws Exception {
        List<Coordinates> origins = Arrays.asList(new Coordinates(40.7128, -74.0060));
        List<Place> places = Arrays.asList(createTestPlace());
        
        String mockResponse = "{\"status\":\"OK\",\"rows\":invalid}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.computeTravelSummaries(origins, places, "driving");
        
        StepVerifier.create(result)
            .assertNext(resultPlaces -> assertEquals(1, resultPlaces.size()))
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_WithoutGeometry() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[{" +
            "\"place_id\":\"test-id\"," +
            "\"name\":\"Test Restaurant\"," +
            "\"vicinity\":\"123 Main St\"" +
            "}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> {
                assertEquals(1, places.size());
                Place place = places.get(0);
                assertEquals("test-id", place.getPlaceId());
                assertNull(place.getCoordinates());
            })
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_WithoutTypes() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[{" +
            "\"place_id\":\"test-id\"," +
            "\"name\":\"Test Restaurant\"," +
            "\"vicinity\":\"123 Main St\"," +
            "\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}" +
            "}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> {
                assertEquals(1, places.size());
                Place place = places.get(0);
                assertNull(place.getTypes());
            })
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_WithFormattedAddress() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[{" +
            "\"place_id\":\"test-id\"," +
            "\"name\":\"Test Restaurant\"," +
            "\"formatted_address\":\"123 Main St, New York, NY\"," +
            "\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}" +
            "}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> {
                assertEquals(1, places.size());
                Place place = places.get(0);
                assertEquals("123 Main St, New York, NY", place.getAddress());
            })
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_MultiplePlacesSorted() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[" +
            "{\"place_id\":\"test-id-1\",\"name\":\"Place 1\",\"vicinity\":\"123 Main St\"," +
            "\"geometry\":{\"location\":{\"lat\":40.7200,\"lng\":-74.0100}}}," +
            "{\"place_id\":\"test-id-2\",\"name\":\"Place 2\",\"vicinity\":\"456 Main St\"," +
            "\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> {
                assertEquals(2, places.size());
                // Should be sorted by distance
                assertTrue(places.get(0).getDistance() <= places.get(1).getDistance());
            })
            .verifyComplete();
    }

    @Test
    void testSearchPlaces_EmptyResults() throws Exception {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        List<String> types = new ArrayList<>();
        int radiusMeters = 5000;
        
        String mockResponse = "{\"status\":\"OK\",\"results\":[]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<List<Place>> result = midpointService.searchPlaces(coordinates, types, radiusMeters);
        
        StepVerifier.create(result)
            .assertNext(places -> assertEquals(0, places.size()))
            .verifyComplete();
    }

    @Test
    void testFindMidpointAndPlaces_MoreThan20Places() throws Exception {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(Arrays.asList("restaurant"));
        
        // Create response with 25 places
        StringBuilder placesResponse = new StringBuilder("{\"status\":\"OK\",\"results\":[");
        for (int i = 0; i < 25; i++) {
            if (i > 0) placesResponse.append(",");
            placesResponse.append("{\"place_id\":\"test-id-").append(i).append("\",")
                .append("\"name\":\"Place ").append(i).append("\",")
                .append("\"vicinity\":\"123 Main St\",")
                .append("\"geometry\":{\"location\":{\"lat\":40.7130,\"lng\":-74.0060}}}");
        }
        placesResponse.append("]}");
        
        String geocodeResponse = "{\"status\":\"OK\",\"results\":[{\"formatted_address\":\"New York, NY, USA\"}]}";
        String distanceMatrixResponse = "{\"status\":\"OK\",\"rows\":[" +
            "{\"elements\":[" +
            String.join(",", java.util.Collections.nCopies(20, "{\"status\":\"OK\",\"distance\":{\"value\":1000,\"text\":\"1 km\"},\"duration\":{\"value\":300,\"text\":\"5 mins\"}}")) +
            "]}" +
            "]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.just(geocodeResponse))
            .thenReturn(Mono.just(placesResponse.toString()))
            .thenReturn(Mono.just(distanceMatrixResponse));
        
        Mono<MidpointResponse> result = midpointService.findMidpointAndPlaces(request);
        
        StepVerifier.create(result)
            .assertNext(response -> {
                assertNotNull(response.getPlaces());
                assertEquals(20, response.getPlaces().size()); // Should be limited to 20
            })
            .verifyComplete();
    }

    @Test
    void testFindMidpointAndPlaces_ReverseGeocodeError() throws Exception {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(new ArrayList<>());
        
        String placesResponse = "{\"status\":\"OK\",\"results\":[]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.error(new RuntimeException("Geocode error")))
            .thenReturn(Mono.just(placesResponse));
        
        Mono<MidpointResponse> result = midpointService.findMidpointAndPlaces(request);
        
        StepVerifier.create(result)
            .assertNext(response -> {
                assertNotNull(response.getMidpoint());
                assertNotNull(response.getMidpointAddress());
                assertTrue(response.getMidpointAddress().contains("40."));
            })
            .verifyComplete();
    }

    @Test
    void testFindMidpointAndPlaces_SearchPlacesError() throws Exception {
        MidpointRequest request = new MidpointRequest();
        request.setCoords(Arrays.asList(
            new Coordinates(40.7128, -74.0060),
            new Coordinates(40.7589, -73.9851)
        ));
        request.setFilters(new ArrayList<>());
        
        String geocodeResponse = "{\"status\":\"OK\",\"results\":[{\"formatted_address\":\"New York, NY, USA\"}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
            .thenReturn(Mono.just(geocodeResponse))
            .thenReturn(Mono.error(new RuntimeException("Places search error")));
        
        Mono<MidpointResponse> result = midpointService.findMidpointAndPlaces(request);
        
        StepVerifier.create(result)
            .assertNext(response -> {
                assertNotNull(response.getMidpoint());
                assertNotNull(response.getPlaces());
                assertEquals(0, response.getPlaces().size());
            })
            .verifyComplete();
    }

    @Test
    void testReverseGeocode_ParseError() {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        String mockResponse = "invalid json";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<String> result = midpointService.reverseGeocode(coordinates);
        
        StepVerifier.create(result)
            .expectNextMatches(address -> address.contains("40.7128") && address.contains("-74.0060"))
            .verifyComplete();
    }

    @Test
    void testReverseGeocode_EmptyResults() {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        String mockResponse = "{\"status\":\"OK\",\"results\":[]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<String> result = midpointService.reverseGeocode(coordinates);
        
        StepVerifier.create(result)
            .expectNextMatches(address -> address.contains("40.7128") && address.contains("-74.0060"))
            .verifyComplete();
    }

    @Test
    void testReverseGeocode_MissingFormattedAddress() {
        Coordinates coordinates = new Coordinates(40.7128, -74.0060);
        String mockResponse = "{\"status\":\"OK\",\"results\":[{}]}";
        
        doReturn(requestHeadersUriSpec).when(webClient).get();
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));
        
        Mono<String> result = midpointService.reverseGeocode(coordinates);
        
        StepVerifier.create(result)
            .expectNextMatches(address -> address.contains("40.7128") && address.contains("-74.0060"))
            .verifyComplete();
    }

    private Place createTestPlace() {
        Place place = new Place();
        place.setPlaceId("test-id");
        place.setName("Test Place");
        place.setAddress("123 Test St");
        place.setCoordinates(new Coordinates(40.7130, -74.0060));
        return place;
    }

    private Place createTestPlace2() {
        Place place = new Place();
        place.setPlaceId("test-id-2");
        place.setName("Test Place 2");
        place.setAddress("456 Test St");
        place.setCoordinates(new Coordinates(40.7140, -74.0070));
        return place;
    }
}

