"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation is not supported by this browser" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        let message = "Failed to get location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location permission denied. You can enter it manually below.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location unavailable. Enter it manually below.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out. Enter it manually below.";
            break;
        }
        setState((s) => ({ ...s, error: message, loading: false }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ latitude: null, longitude: null, error: null, loading: false });
  }, []);

  return { ...state, request, reset };
}
