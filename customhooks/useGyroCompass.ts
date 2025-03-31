"use client";

import { useEffect, useState, useRef } from "react";

import useGeolocation from "./useGeolocation";

interface DeviceOrientationEventWithCompass extends DeviceOrientationEvent {
    webkitCompassHeading?: number;
    requestPermission?: () => Promise<string>;
}

const useGyroCompass = () => {
    const [rotation, setRotation] = useState(0);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const prevRotation = useRef<number | null>(null);
    const [declination, setDeclination] = useState(0);

    // useGeolocation フックで現在地を取得
    const { latitude, longitude, error } = useGeolocation();

    // 緯度・経度の変化を監視し、地磁気偏角を取得
    useEffect(() => {
        if (latitude !== null && longitude !== null) {
            getMagneticDeclination(latitude, longitude);
        }
    }, [latitude, longitude]);

    // ジャイロセンサーのイベントリスナーを設定
    useEffect(() => {
        if (!permissionGranted) return;
        window.addEventListener("deviceorientation", handleOrientation, true);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [permissionGranted]);

    // iOS のセンサー許可リクエスト
    const requestPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
            try {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === "granted") {
                    setPermissionGranted(true);
                    window.addEventListener("deviceorientation", handleOrientation, true);
                } else {
                    alert("センサーの許可が必要です");
                }
            } catch (error) {
                console.error("許可リクエスト失敗", error);
            }
        } else {
            setPermissionGranted(true);
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    };

    // 磁気偏角（declination）を取得
    const getMagneticDeclination = async (lat: number, lon: number) => {
        try {
            if (lat === null || lon === null) {
                console.error("緯度または経度が無効です:", { lat, lon });
                return;
            }

            const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=${lat}&lon1=${lon}&resultFormat=json`;
            console.log("リクエストURL:", url); // デバッグ用

            const response = await fetch(url);

            // レスポンスのステータスコードを確認
            if (!response.ok) {
                console.error(`HTTPエラー: ${response.status}`, await response.text());
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("予期しないレスポンス:", text);
                throw new Error("JSONではなくHTMLが返されました");
            }

            const data = await response.json();
            setDeclination(data.declination || 0);
        } catch (error) {
            console.error("磁気偏角の取得失敗", error);
        }
    };

    // デバイスの向きを取得・補正
    const handleOrientation = (event: DeviceOrientationEventWithCompass) => {
        let degrees: number | undefined;

        if (event.webkitCompassHeading !== undefined) {
            degrees = event.webkitCompassHeading; // iOS
        } else if (event.alpha !== null && event.alpha !== undefined) {
            degrees = 360 - event.alpha; // Android
        }

        if (degrees === undefined) return;

        // 地磁気偏角を補正
        degrees = (degrees + declination + 360) % 360;

        // スムージング処理（前回の値との補間）
        if (prevRotation.current !== null) {
            let diff = ((degrees - prevRotation.current + 540) % 360) - 180; // 最短回転方向
            degrees = (prevRotation.current + diff * 0.1 + 360) % 360; // スムージング後も 0~359度に補正
        }
        prevRotation.current = degrees;

        setRotation(Math.round(degrees));
    };

    // 画面の表示状態が変わった時の処理
    const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
            window.removeEventListener("deviceorientation", handleOrientation);
        } else if (permissionGranted) {
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    };

    return { rotation, permissionGranted, requestPermission, error };
};

export default useGyroCompass;
