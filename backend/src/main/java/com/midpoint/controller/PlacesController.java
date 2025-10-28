package com.midpoint.controller;

import com.midpoint.dto.*;
import com.midpoint.service.GoogleMapsService;
import com.midpoint.service.MidpointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "*")
public class PlacesController {

    @Autowired
    private GoogleMapsService googleMapsService;

    @Autowired
    private MidpointService midpointService;

    @GetMapping("/autocomplete")
    public Mono<ResponseEntity<List<PlacePrediction>>> getPlaceAutocomplete(
            @RequestParam String input,
            @RequestParam(required = false) String sessionToken) {
        
        // Generate session token if not provided
        String token = sessionToken != null ? sessionToken : UUID.randomUUID().toString();
        
        return googleMapsService.getPlaceAutocomplete(input, token)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/details")
    public Mono<ResponseEntity<PlaceDetails>> getPlaceDetails(
            @RequestParam String placeId,
            @RequestParam(required = false) String sessionToken) {
        
        // Generate session token if not provided
        String token = sessionToken != null ? sessionToken : UUID.randomUUID().toString();
        
        return googleMapsService.getPlaceDetails(placeId, token)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @PostMapping("/midpoint")
    public Mono<ResponseEntity<MidpointResponse>> findMidpoint(@RequestBody MidpointRequest request) {
        return midpointService.findMidpointAndPlaces(request)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Places API is running");
    }
}
