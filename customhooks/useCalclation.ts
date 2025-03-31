"use client";

import { useState, useEffect } from "react";

import { fetchLocations, setDistance } from "@/utils/supabaseFunction";
import { Geodesic } from "geographiclib";

const toRadians = (degrees: number) => degrees * (Math.PI / 180);
const toDegrees = (radians: number) => radians * (180 / Math.PI);

// 2点間の距離を計算
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const geod = Geodesic.WGS84;
  const result = geod.Inverse(lat1, lon1, lat2, lon2);
  return result.s12; // 距離（メートル）
};

// 目的地の方角を計算
const getAngle = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const λ1 = toRadians(lon1);
  const λ2 = toRadians(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360; // 方角（度）
};

// 高度を計算
const getHeight = (altitude1: number, altitude2: number) => {
  return altitude1 - altitude2;
};

const useCalclation = () => {
  const [myLatitude, setMyLatitude] = useState<number | null>(null);
  const [myLongitude, setMyLongitude] = useState<number | null>(null);
  const [myAltitude, setMyAltitude] = useState<number | null>(null);
  const [hostLatitude, setHostLatitude] = useState<number | null>(null);
  const [hostLongitude, setHostLongitude] = useState<number | null>(null);
  const [hostAltitude, setHostAltitude] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // 初回データ取得
    const initialize = async () => {
      const locations = await fetchLocations();
      setMyLatitude(locations.myLatitude);
      setMyLongitude(locations.myLongitude);
      setMyAltitude(locations.myAltitude);
      setHostLatitude(locations.hostLatitude);
      setHostLongitude(locations.hostLongitude);
      setHostAltitude(locations.hostAltitude);
    };

    initialize();

    // 5秒ごとに位置情報を更新
    intervalId = setInterval(async () => {
      const updatedLocations = await fetchLocations();
      setMyLatitude(updatedLocations.myLatitude);
      setMyLongitude(updatedLocations.myLongitude);
      setMyAltitude(updatedLocations.myAltitude);
      setHostLatitude(updatedLocations.hostLatitude);
      setHostLongitude(updatedLocations.hostLongitude);
      setHostAltitude(updatedLocations.hostAltitude);
    }, 5000); // 5秒ごとに更新

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const distance =
    myLatitude !== null && myLongitude !== null && hostLatitude !== null && hostLongitude !== null
      ? getDistance(myLatitude, myLongitude, hostLatitude, hostLongitude)
      : 0;

  if (distance) {
    setDistance(distance);
  }

  const angle =
    myLatitude !== null && myLongitude !== null && hostLatitude !== null && hostLongitude !== null
      ? getAngle(myLatitude, myLongitude, hostLatitude, hostLongitude)
      : 0;

  const height =
    myAltitude !== null && hostAltitude !== null
      ? getHeight(myAltitude, hostAltitude)
      : 0;

  return { distance, angle, height };
};

export default useCalclation;
