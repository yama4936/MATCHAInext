"use client";

import { useEffect } from "react";

import { ResetData } from "@/utils/supabaseFunction";

import useGeolocation from "@/customhooks/useGeolocation";

const DataInitialize = () => {

  const { stopWatching } = useGeolocation();

  useEffect(() => {
    const resetData = async () => {
        await ResetData();
    };

    resetData();
    stopWatching();
  }, []);
  return null;
};

export default DataInitialize;