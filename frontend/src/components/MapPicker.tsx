import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

interface MapPickerProps {
  apiKey: string;
  latitude: number | string;
  longitude: number | string;
  onLocationChange: (lat: number, lng: number) => void;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = [
  "places",
];

const MapPicker: React.FC<MapPickerProps> = ({
  apiKey,
  latitude,
  longitude,
  onLocationChange,
  defaultCenter = { lat: 43.6532, lng: -79.3832 }, // Default to Toronto
  defaultZoom = 11,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const latNum = parseFloat(String(latitude));
    const lngNum = parseFloat(String(longitude));
    if (
      !isNaN(latNum) &&
      !isNaN(lngNum) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lngNum >= -180 &&
      lngNum <= 180
    ) {
      const newPos = { lat: latNum, lng: lngNum };
      setCurrentPosition(newPos);
      if (mapInstance) {
        mapInstance.panTo(newPos);
      }
    } else if (latitude === "" && longitude === "") {
      // Clear marker if inputs are cleared
      setCurrentPosition(null);
    }
  }, [latitude, longitude, mapInstance]);

  const onMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  const onMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMapInstance(map);
      // Set initial position if available and valid
      const latNum = parseFloat(String(latitude));
      const lngNum = parseFloat(String(longitude));
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const initialPos = { lat: latNum, lng: lngNum };
        setCurrentPosition(initialPos);
        map.panTo(initialPos);
        map.setZoom(defaultZoom + 2 > 20 ? 20 : defaultZoom + 4); // Zoom in a bit if a specific point is set
      } else {
        map.panTo(defaultCenter);
        map.setZoom(defaultZoom);
      }
    },
    [latitude, longitude, defaultCenter, defaultZoom]
  );

  const onUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  const onAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onLocationChange(lat, lng);
        if (mapInstance) {
          mapInstance.panTo({ lat, lng });
          mapInstance.setZoom(15);
        }
      }
    }
  };

  if (loadError) {
    return (
      <div>
        Error loading maps. Please ensure your API key is correct and the Maps
        JavaScript API is enabled. Details: {loadError.message}
      </div>
    );
  }

  return isLoaded ? (
    <div style={{ marginBottom: "20px" }}>
      <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder="Search for a place"
          ref={searchInputRef}
          style={{
            boxSizing: `border-box`,
            border: `1px solid transparent`,
            width: `240px`,
            height: `38px`,
            padding: `0 12px`,
            borderRadius: `3px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipses`,
            position: "absolute",
            left: "50%",
            marginLeft: "-120px", // Half of width to center it
            zIndex: 10, // Ensure it's above the map
            marginTop: "10px", // Some spacing from the top of the map container
          }}
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || defaultCenter} // Use currentPosition if set, otherwise defaultCenter
        zoom={
          currentPosition
            ? mapInstance?.getZoom() || defaultZoom + 4
            : defaultZoom
        } // Maintain zoom or use a more zoomed-in default if position set
        onClick={onMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {currentPosition && (
          <Marker
            position={currentPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading Maps...</div>
  );
};

export default MapPicker;
