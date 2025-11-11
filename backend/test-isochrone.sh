#!/bin/bash

# Test script for Isochrone functionality
# Make sure your backend is running: mvn spring-boot:run
# Make sure MAPBOX_API_KEY is set: export MAPBOX_API_KEY="your_key"

echo "🧪 Testing Isochrone Functionality"
echo "=================================="
echo ""

# Test 1: Two close locations in NYC (should find overlap)
echo "Test 1: Two close locations in NYC (should find overlap)"
echo "--------------------------------------------------------"
curl -s "http://localhost:8080/api/places/test/isochrone?lat1=40.7128&lng1=-74.0060&lat2=40.7589&lng2=-73.9851&minutes=10" | jq .
echo ""
echo ""

# Test 2: Two locations further apart (might not find overlap)
echo "Test 2: Two locations further apart (might not find overlap)"
echo "------------------------------------------------------------"
curl -s "http://localhost:8080/api/places/test/isochrone?lat1=40.7128&lng1=-74.0060&lat2=40.7589&lng2=-73.9851&minutes=5" | jq .
echo ""
echo ""

# Test 3: Test with the main midpoint endpoint (full flow)
echo "Test 3: Full midpoint endpoint (tests full integration)"
echo "------------------------------------------------------"
curl -s -X POST http://localhost:8080/api/places/midpoint \
  -H "Content-Type: application/json" \
  -d '{
    "coords": [
      {"lat": 40.7128, "lng": -74.0060},
      {"lat": 40.7589, "lng": -73.9851}
    ],
    "filters": ["restaurant"]
  }' | jq '.midpoint, .midpoint_address' 
echo ""
echo ""

echo "✅ Testing complete!"
echo ""
echo "What to check:"
echo "1. If 'success: true' - isochrone intersection was found"
echo "2. If 'success: false' - no overlap (locations too far or API issue)"
echo "3. Check the 'centroid' coordinates if success is true"
echo "4. Compare with regular midpoint endpoint to see difference"

