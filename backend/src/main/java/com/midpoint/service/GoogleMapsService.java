package com.midpoint.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.midpoint.dto.PlaceDetails;
import com.midpoint.dto.PlacePrediction;
import com.midpoint.exception.PlacesResponseParsingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleMapsService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(GoogleMapsService.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${google.maps.api.key}")
    private String apiKey;
    
    private static final String PLACES_AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    private static final String PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

    public GoogleMapsService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    public Mono<List<PlacePrediction>> getPlaceAutocomplete(String input, String sessionToken) {
        String url = String.format("%s?input=%s&key=%s&sessiontoken=%s&types=establishment|geocode",
                PLACES_AUTOCOMPLETE_URL, 
                input.replace(" ", "%20"), 
                apiKey, 
                sessionToken);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseAutocompleteResponse)
                .doOnError(error -> LOGGER.error("Autocomplete error: " + error.getMessage()))
                .onErrorReturn(new ArrayList<>());
    }

    public Mono<PlaceDetails> getPlaceDetails(String placeId, String sessionToken) {
        String url = String.format("%s?place_id=%s&key=%s&sessiontoken=%s&fields=place_id,name,formatted_address,geometry,formatted_phone_number,website,rating,types",
                PLACE_DETAILS_URL, 
                placeId, 
                apiKey, 
                sessionToken);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parsePlaceDetailsResponse)
                .onErrorReturn(new PlaceDetails());
    }

    private List<PlacePrediction> parseAutocompleteResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode predictions = root.get("predictions");
            
            List<PlacePrediction> result = new ArrayList<>();
            if (predictions != null && predictions.isArray()) {
                for (JsonNode prediction : predictions) {
                    PlacePrediction place = new PlacePrediction();
                    place.setPlaceId(prediction.get("place_id").asText());
                    place.setDescription(prediction.get("description").asText());
                    
                    JsonNode structuredFormatting = prediction.get("structured_formatting");
                    if (structuredFormatting != null) {
                        PlacePrediction.StructuredFormatting formatting = new PlacePrediction.StructuredFormatting();
                        formatting.setMainText(structuredFormatting.get("main_text").asText());
                        if (structuredFormatting.has("secondary_text")) {
                            formatting.setSecondaryText(structuredFormatting.get("secondary_text").asText());
                        }
                        place.setStructuredFormatting(formatting);
                    }
                    
                    result.add(place);
                }
            }
            return result;
        } catch (JsonProcessingException e) {
            throw new PlacesResponseParsingException("Error parsing autocomplete response", e);
        }
    }

    private PlaceDetails parsePlaceDetailsResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode result = root.get("result");
            
            if (result == null) {
                return new PlaceDetails();
            }
            
            PlaceDetails placeDetails = new PlaceDetails();
            placeDetails.setPlaceId(result.get("place_id").asText());
            placeDetails.setName(result.get("name").asText());
            placeDetails.setFormattedAddress(result.get("formatted_address").asText());
            
            // Parse geometry
            JsonNode geometry = result.get("geometry");
            if (geometry != null) {
                PlaceDetails.Geometry geom = new PlaceDetails.Geometry();
                JsonNode location = geometry.get("location");
                if (location != null) {
                    PlaceDetails.Geometry.Location loc = new PlaceDetails.Geometry.Location();
                    loc.setLat(location.get("lat").asDouble());
                    loc.setLng(location.get("lng").asDouble());
                    geom.setLocation(loc);
                }
                placeDetails.setGeometry(geom);
            }
            
            // Parse additional fields
            if (result.has("formatted_phone_number")) {
                placeDetails.setFormattedPhoneNumber(result.get("formatted_phone_number").asText());
            }
        if (result.has("website")) {
                placeDetails.setWebsite(result.get("website").asText());
            }
            if (result.has("rating")) {
                placeDetails.setRating(result.get("rating").asDouble());
            }
            if (result.has("types")) {
                JsonNode types = result.get("types");
                if (types.isArray()) {
                    String[] typesArray = new String[types.size()];
                    for (int i = 0; i < types.size(); i++) {
                        typesArray[i] = types.get(i).asText();
                    }
                    placeDetails.setTypes(typesArray);
                }
            }
            
            return placeDetails;
        } catch (JsonProcessingException e) {
            throw new PlacesResponseParsingException("Error parsing place details response", e);
        }
    }
}
