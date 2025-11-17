package com.midpoint.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.midpoint.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MidpointService {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(MidpointService.class);
    private static final String ORIGIN_LABEL = "    Origin ";
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${google.maps.api.key}")
    private String apiKey;
    
    private static final String PLACES_NEARBY_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";
    private static final String DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
    private static final String PLACE_PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo";

    public MidpointService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calculate centroid between N coordinates (spherical mean approximation)
     */
    public Coordinates calculateCentroid(List<Coordinates> coords) {
        if (coords.isEmpty()) {
            throw new IllegalArgumentException("No coordinates provided");
        }

        double x = 0, y = 0, z = 0;

        for (Coordinates coord : coords) {
            double latRad = Math.toRadians(coord.getLat());
            double lngRad = Math.toRadians(coord.getLng());

            x += Math.cos(latRad) * Math.cos(lngRad);
            y += Math.cos(latRad) * Math.sin(lngRad);
            z += Math.sin(latRad);
        }

        int total = coords.size();
        x = x / total;
        y = y / total;
        z = z / total;

        double lngRad = Math.atan2(y, x);
        double hyp = Math.sqrt(x * x + y * y);
        double latRad = Math.atan2(z, hyp);

        return new Coordinates(Math.toDegrees(latRad), Math.toDegrees(lngRad));
    }

    /**
     * Calculate geodesic midpoint between two coordinates
     */
    public Coordinates calculateGeodesicMidpoint(Coordinates a, Coordinates b) {
        double lat1 = Math.toRadians(a.getLat());
        double lon1 = Math.toRadians(a.getLng());
        double lat2 = Math.toRadians(b.getLat());
        double lon2 = Math.toRadians(b.getLng());

        double dLon = lon2 - lon1;

        double Bx = Math.cos(lat2) * Math.cos(dLon);
        double By = Math.cos(lat2) * Math.sin(dLon);

        double lat3 = Math.atan2(
            Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
        );
        double lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

        return new Coordinates(Math.toDegrees(lat3), Math.toDegrees(lon3));
    }

    /**
     * Calculate distance between two coordinates in miles
     */
    public double calculateDistance(Coordinates coord1, Coordinates coord2) {
        final double R = 3959; // Earth's radius in miles
        double dLat = Math.toRadians(coord2.getLat() - coord1.getLat());
        double dLng = Math.toRadians(coord2.getLng() - coord1.getLng());
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(Math.toRadians(coord1.getLat())) *
                  Math.cos(Math.toRadians(coord2.getLat())) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Compute dynamic search radius (in meters) based on input coordinates
     */
    public int computeDynamicRadiusMeters(List<Coordinates> coords) {
        if (coords.size() < 2) {
            // Minimum radius of 2 miles if only one coordinate
            double minMeters = 2 * 1609.34;
            return Math.min(50000, Math.max(1000, (int) Math.round(minMeters)));
        }

        // Determine the maximum pairwise distance between any two inputs (miles)
        double maxMiles = 0;
        for (int i = 0; i < coords.size(); i++) {
            for (int j = i + 1; j < coords.size(); j++) {
                double d = calculateDistance(coords.get(i), coords.get(j));
                if (d > maxMiles) maxMiles = d;
            }
        }

        double radiusMiles = Math.max(maxMiles * 0.3, 2); // 30% of distance, min 2 miles
        double radiusMeters = radiusMiles * 1609.34;
        // Google Places Nearby Search allows up to 50,000 meters
        return Math.min(50000, Math.max(500, (int) Math.round(radiusMeters)));
    }

    /**
     * Ensure midpoint lies between the input locations; if not, correct it
     */
    public Coordinates validateAndCorrectMidpoint(Coordinates midpoint, List<Coordinates> coords) {
        if (coords.size() < 2) return midpoint;

        // Find the farthest pair (diameter)
        double maxMiles = -1;
        Coordinates farA = coords.get(0);
        Coordinates farB = coords.get(1);
        
        for (int i = 0; i < coords.size(); i++) {
            for (int j = i + 1; j < coords.size(); j++) {
                double d = calculateDistance(coords.get(i), coords.get(j));
                if (d > maxMiles) {
                    maxMiles = d;
                    farA = coords.get(i);
                    farB = coords.get(j);
                }
            }
        }

        // Midpoint should be within half the farthest distance from each of the farthest endpoints
        double tolMiles = 0.25; // small tolerance
        double half = maxMiles / 2 + tolMiles;
        double dToA = calculateDistance(midpoint, farA);
        double dToB = calculateDistance(midpoint, farB);

        if (dToA > half || dToB > half) {
            // Correct to geodesic midpoint of the farthest pair
            return calculateGeodesicMidpoint(farA, farB);
        }

        return midpoint;
    }

    /**
     * Reverse geocode coordinates to get address
     */
    public Mono<String> reverseGeocode(Coordinates coordinates) {
        String url = String.format("%s?latlng=%s,%s&key=%s",
                GEOCODING_URL, coordinates.getLat(), coordinates.getLng(), apiKey);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        if ("OK".equals(root.get("status").asText()) && 
                            root.has("results") && root.get("results").isArray() && 
                            root.get("results").size() > 0) {
                            return root.get("results").get(0).get("formatted_address").asText();
                        }
                    } catch (Exception e) {
                        LOGGER.error("Error parsing reverse geocoding response", e);
                    }
                    return String.format("%.4f°, %.4f°", coordinates.getLat(), coordinates.getLng());
                })
                .onErrorReturn(String.format("%.4f°, %.4f°", coordinates.getLat(), coordinates.getLng()));
    }

    /**
     * Get photo URL from Google Places API
     */
    public String getPhotoUrl(String photoReference, int maxWidth) {
        return String.format("%s?maxwidth=%d&photo_reference=%s&key=%s",
                PLACE_PHOTO_URL, maxWidth, photoReference, apiKey);
    }

    /**
     * Search for places near coordinates
     */
    public Mono<List<Place>> searchPlaces(Coordinates coordinates, List<String> types, int radiusMeters) {
        String typeFilter = types.isEmpty() ? 
            "restaurant|cafe|park|gas_station|shopping_mall|movie_theater" : 
            String.join("|", types);

        String url = String.format("%s?location=%s,%s&radius=%d&type=%s&key=%s",
                PLACES_NEARBY_SEARCH_URL, coordinates.getLat(), coordinates.getLng(), 
                radiusMeters, typeFilter, apiKey);

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        if (!"OK".equals(root.get("status").asText())) {
                            throw new RuntimeException("Places API error: " + root.get("status").asText());
                        }

                        List<Place> places = new ArrayList<>();
                        JsonNode results = root.get("results");
                        if (results != null && results.isArray()) {
                            for (JsonNode placeNode : results) {
                                Place place = new Place();
                                place.setPlaceId(placeNode.get("place_id").asText());
                                place.setName(placeNode.get("name").asText());
                                place.setAddress(placeNode.has("vicinity") ? 
                                    placeNode.get("vicinity").asText() : 
                                    placeNode.get("formatted_address").asText());
                                
                                if (placeNode.has("rating")) {
                                    place.setRating(placeNode.get("rating").asDouble());
                                }
                                if (placeNode.has("user_ratings_total")) {
                                    place.setUserRatingsTotal(placeNode.get("user_ratings_total").asInt());
                                }
                                if (placeNode.has("price_level")) {
                                    place.setPriceLevel(placeNode.get("price_level").asInt());
                                }

                                // Parse photos
                                if (placeNode.has("photos")) {
                                    List<Place.Photo> photos = new ArrayList<>();
                                    JsonNode photosNode = placeNode.get("photos");
                                    for (JsonNode photoNode : photosNode) {
                                        Place.Photo photo = new Place.Photo();
                                        photo.setPhotoReference(photoNode.get("photo_reference").asText());
                                        photo.setHeight(photoNode.get("height").asInt());
                                        photo.setWidth(photoNode.get("width").asInt());
                                        photo.setUrl(getPhotoUrl(photo.getPhotoReference(), 400));
                                        photos.add(photo);
                                    }
                                    place.setPhotos(photos);
                                }

                                // Parse types
                                if (placeNode.has("types")) {
                                    JsonNode typesNode = placeNode.get("types");
                                    String[] typesArray = new String[typesNode.size()];
                                    for (int i = 0; i < typesNode.size(); i++) {
                                        typesArray[i] = typesNode.get(i).asText();
                                    }
                                    place.setTypes(typesArray);
                                }

                                // Parse coordinates
                                JsonNode geometry = placeNode.get("geometry");
                                if (geometry != null && geometry.has("location")) {
                                    JsonNode location = geometry.get("location");
                                    Coordinates placeCoords = new Coordinates(
                                        location.get("lat").asDouble(),
                                        location.get("lng").asDouble()
                                    );
                                    place.setCoordinates(placeCoords);
                                    place.setDistance(calculateDistance(coordinates, placeCoords));
                                }

                                places.add(place);
                            }
                        }

                        // Sort by distance
                        places.sort(Comparator.comparing(Place::getDistance));
                        return places;
                    } catch (Exception e) {
                        throw new RuntimeException("Error parsing places response", e);
                    }
                })
                .onErrorReturn(new ArrayList<>());
    }

    /**
     * Compute per-origin travel summaries to each place using Google Distance Matrix
     */
    public Mono<List<Place>> computeTravelSummaries(List<Coordinates> origins, List<Place> places, String mode) {
        if (places.isEmpty() || origins.isEmpty()) {
            LOGGER.warn("⚠️  [ISOCHRONE] Skipping travel summaries - empty origins or places");
            return Mono.just(places);
        }

        LOGGER.info("🔍 [ISOCHRONE] Computing travel summaries");
        LOGGER.info("  📍 Origins: {}", origins.size());
        for (int i = 0; i < origins.size(); i++) {
            Coordinates origin = origins.get(i);
            LOGGER.info("{}{}: ({}, {})", ORIGIN_LABEL, i, origin.getLat(), origin.getLng());
        }
        LOGGER.info("  🎯 Destinations: {}", places.size());
        for (int i = 0; i < Math.min(places.size(), 5); i++) {
            Place place = places.get(i);
            LOGGER.info("    Place {}: {} at ({}, {})",
                    i,
                    place.getName(),
                    place.getCoordinates().getLat(),
                    place.getCoordinates().getLng());
        }
        if (places.size() > 5) {
            LOGGER.info("    ... and {} more places", places.size() - 5);
        }
        LOGGER.info("  🚗 Mode: {}", mode);

        // Build request parameters
        String originsParam = origins.stream()
                .map(coord -> coord.getLat() + "," + coord.getLng())
                .collect(Collectors.joining("|"));
        
        String destinationsParam = places.stream()
                .map(place -> place.getCoordinates().getLat() + "," + place.getCoordinates().getLng())
                .collect(Collectors.joining("|"));

        String url = String.format("%s?origins=%s&destinations=%s&mode=%s&key=%s",
                DISTANCE_MATRIX_URL, originsParam, destinationsParam, mode, apiKey);

        LOGGER.info("  🔗 Distance Matrix API URL: {}", url.replace(apiKey, "***"));

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        String apiStatus = root.has("status") ? root.get("status").asText() : "UNKNOWN";
                        LOGGER.info("  📊 API Response Status: {}", apiStatus);
                        
                        if (!"OK".equals(apiStatus) || !root.has("rows")) {
                            LOGGER.error("  ❌ [ISOCHRONE] API error or no rows - status: {}", apiStatus);
                            return places;
                        }

                        List<Place> enhanced = new ArrayList<>();
                        JsonNode rows = root.get("rows");

                        LOGGER.info("  ✅ Processing {} origin rows and {} destinations", rows.size(), places.size());

                        for (int i = 0; i < places.size(); i++) {
                            Place place = places.get(i);
                            List<Place.TravelSummary> travelSummaries = new ArrayList<>();

                            LOGGER.info("  📍 Place: {}", place.getName());
                            
                            for (int j = 0; j < origins.size(); j++) {
                                JsonNode row = rows.get(j);
                                JsonNode elements = row.get("elements");
                                JsonNode element = elements.get(i);

                                String status = element.get("status").asText();
                                if (!"OK".equals(status)) {
                                    LOGGER.warn("{}{} → ❌ Status: {}", ORIGIN_LABEL, j, status);
                                    travelSummaries.add(new Place.TravelSummary(j, null, null, null, null, mode));
                                } else {
                                    Place.TravelSummary summary = new Place.TravelSummary();
                                    summary.setOriginIndex(j);
                                    summary.setMode(mode);

                                    int distanceMeters = 0;
                                    String distanceText = "";
                                    int durationSeconds = 0;
                                    String durationText = "";

                                    if (element.has("distance")) {
                                        distanceMeters = element.get("distance").get("value").asInt();
                                        distanceText = element.get("distance").get("text").asText();
                                        summary.setDistanceMeters(distanceMeters);
                                        summary.setDistanceText(distanceText);
                                    }
                                    if (element.has("duration")) {
                                        durationSeconds = element.get("duration").get("value").asInt();
                                        durationText = element.get("duration").get("text").asText();
                                        summary.setDurationSeconds(durationSeconds);
                                        summary.setDurationText(durationText);
                                    }

                                    double durationMinutes = durationSeconds / 60.0;
                                    LOGGER.info("{}{} → ✅ {} ({} min), {}",
                                            ORIGIN_LABEL,
                                            j,
                                            durationText,
                                            String.format("%.1f", durationMinutes),
                                            distanceText);

                                    travelSummaries.add(summary);
                                }
                            }

                            place.setTravelSummaries(travelSummaries);
                            enhanced.add(place);
                        }

                        LOGGER.info("✅ [ISOCHRONE] Travel summaries computed for {} places", enhanced.size());
                        return enhanced;
                    } catch (Exception e) {
                        LOGGER.error("❌ [ISOCHRONE] Error parsing distance matrix response", e);
                        return places;
                    }
                })
                .onErrorReturn(places)
                .doOnError(error -> {
                    LOGGER.error("❌ [ISOCHRONE] Error calling Distance Matrix API", error);
                });
    }

    /**
     * Main method to find midpoint and nearby places
     */
    public Mono<MidpointResponse> findMidpointAndPlaces(MidpointRequest request) {
        LOGGER.info("🎯 [MIDPOINT] Starting midpoint calculation");
        LOGGER.info("  📍 Input coordinates: {}", request.getCoords().size());
        for (int i = 0; i < request.getCoords().size(); i++) {
            Coordinates coord = request.getCoords().get(i);
            LOGGER.info("    Coord {}: ({}, {})", i, coord.getLat(), coord.getLng());
        }
        LOGGER.info("  🔍 Filters: {}", request.getFilters().isEmpty() ? "none (default)" : request.getFilters());

        // Calculate centroid from provided coordinates
        Coordinates initialMidpoint = calculateCentroid(request.getCoords());
        LOGGER.info("  📐 Initial centroid: ({}, {})", initialMidpoint.getLat(), initialMidpoint.getLng());

        // Validate that the midpoint is actually between the input locations; correct if needed
        final Coordinates midpoint = validateAndCorrectMidpoint(initialMidpoint, request.getCoords());
        boolean wasCorrected = Math.abs(midpoint.getLat() - initialMidpoint.getLat()) > 0.0001 ||
                               Math.abs(midpoint.getLng() - initialMidpoint.getLng()) > 0.0001;
        if (wasCorrected) {
            LOGGER.warn("  ⚠️  Midpoint corrected: ({}, {})", midpoint.getLat(), midpoint.getLng());
        } else {
            LOGGER.info("  ✅ Final midpoint: ({}, {})", midpoint.getLat(), midpoint.getLng());
        }

        // Get midpoint address
        Mono<String> midpointAddressMono = reverseGeocode(midpoint)
                .doOnNext(address -> LOGGER.info("  🏠 Midpoint address: {}", address));

        // Compute dynamic radius from the spread of user locations
        // Fixed 5-mile radius as requested
        int radiusMeters = (int) (5 * 1609.34); // 5 miles in meters
        LOGGER.info("  📏 Search radius: 5 miles ({} meters)", radiusMeters);

        // Search for places near midpoint with dynamic radius
        Mono<List<Place>> placesMono = searchPlaces(midpoint, request.getFilters(), radiusMeters)
                .doOnNext(places -> LOGGER.info("  🏢 Found {} places near midpoint", places.size()))
                .flatMap(places -> {
                    // Limit early to reduce Distance Matrix elements
                    List<Place> limitedPlaces = places.stream()
                            .limit(20)
                            .collect(Collectors.toList());
                    LOGGER.info("  🔢 Limiting to {} places for travel time calculation", limitedPlaces.size());

                    // Compute per-origin travel summaries for these places
                    return computeTravelSummaries(request.getCoords(), limitedPlaces, "driving");
                });

        return Mono.zip(midpointAddressMono, placesMono)
                .map(tuple -> {
                    LOGGER.info("✅ [MIDPOINT] Calculation complete - returning {} places", tuple.getT2().size());
                    return new MidpointResponse(midpoint, tuple.getT1(), tuple.getT2(), radiusMeters);
                });
    }
}
