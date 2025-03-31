"use client";

import { useState, useEffect } from "react";

import { updateLocation } from "@/utils/supabaseFunction";

const useGeolocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  let intervalId: NodeJS.Timeout | null = null;

  const fetchLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("位置情報が取得できないブラウザのようです");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAltitude(position.coords.altitude);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const startWatching = () => {
    if (isWatching) return; // すでに実行中なら何もしない
    setIsWatching(true);

    fetchLocation(); // 初回取得
    intervalId = setInterval(fetchLocation, 1500); // 1.5秒ごとに取得
  };

  const stopWatching = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsWatching(false);
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (latitude !== null && longitude !== null && altitude !== null) {
      updateLocation(latitude, longitude, altitude);
    }
  }, [latitude, longitude, altitude]);

  return {
    latitude,
    longitude,
    altitude,
    error,
    isWatching,
    startWatching,
    stopWatching,
  };
};

export default useGeolocation;
