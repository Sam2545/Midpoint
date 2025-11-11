#!/bin/bash

# Simple test to verify Mapbox Isochrone API works
# Usage: ./test-mapbox-api.sh YOUR_MAPBOX_ACCESS_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Mapbox access token"
    echo "Usage: ./test-mapbox-api.sh YOUR_MAPBOX_ACCESS_TOKEN"
    exit 1
fi

MAPBOX_TOKEN=$1

echo "🧪 Testing Mapbox Isochrone API"
echo "==============================="
echo ""

# Test with NYC coordinates
LAT=40.7128
LNG=-74.0060
MINUTES=10

echo "📍 Testing with coordinates: $LAT, $LNG"
echo "⏱️  Travel time: $MINUTES minutes"
echo ""

URL="https://api.mapbox.com/isochrone/v1/mapbox/driving/$LNG,$LAT?contours_minutes=$MINUTES&polygons=true&access_token=$MAPBOX_TOKEN"

echo "🔗 API URL:"
echo "$URL"
echo ""
echo "📥 Response:"
echo ""

curl -s "$URL" | jq '{
    type: .type,
    features_count: (.features | length),
    first_feature: {
        contour_minutes: .features[0].properties.contour,
        coordinates_count: (.features[0].geometry.coordinates[0] | length)
    }
}'

echo ""
echo ""
echo "✅ If you see features_count > 0, the API is working!"
echo "❌ If you see an error, check your token and API access"

