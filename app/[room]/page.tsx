"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CheckRole } from "@/utils/supabaseFunction";

import useGeolocation from "@/customhooks/useGeolocation";

import ShowRoomDetails from "@/components/elements/host/ShowRoomDetails";
import ShowClients from "@/components/elements/host/ShowClients";
import HostExit from "@/components/elements/host/HostExit";

import ShowRoom from "@/components/elements/client/ShowRoom";
import ShowDistance from "@/components/elements/client/ShowDistance";
import ClientExit from "@/components/elements/client/ClientExit";
import ChatModal from "@/components/elements/ChatModal";

const Room = () => {
  const router = useRouter();
  const [userrole, setUserrole] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [timeoutDone, setTimeoutDone] = useState(false);
  const { startWatching } = useGeolocation();

  //ユーザにロールを付与
  useEffect(() => {
    const checkUserRole = async () => {
      const role = await CheckRole();
      setUserrole(role);
      if (
        (userrole !== null && userrole !== "host" && userrole !== "client") ||
        localStorage.getItem("id") == null
      ) {
        router.push(`/`);
      }else{
        startWatching();
      }
    };
    checkUserRole();
  }, []);

  // フォントのセット
  useEffect(() => {
    let isMounted = true;

    document.fonts.ready.then(() => {
      if (isMounted) setFontsReady(true);
    });

    const timer = setTimeout(() => {
      if (isMounted) setTimeoutDone(true);
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (userrole === "host") {
    // ホスト側の表示
    return (
      <div className="relative h-screen bg-white">
        {/* ルーム名 */}
        <ShowRoomDetails />

        {/* クライアント表示 */}
        <ShowClients />

        <div className="h-[15vh] justify-start items-center flex absolute mt-1">
          {/* 退出ボタン */}
          <HostExit />

          {/* チャットボタン */}
          <ChatModal/>
        </div>
      </div>
    );
  } else if (userrole === "client") {
    // クライアント側の表示
    return (
      <div>
        <div className="relative h-screen bg-white">
          {/* ルーム名 */}
          <ShowRoom />

          {/* 距離と角度表示 */}
          <ShowDistance />

          <div className="h-[15vh] justify-start items-center flex absolute mt-1">
            {/* 退出ボタン */}
            <ClientExit />

            {/* チャットボタン */}
            <ChatModal/>
          </div>
        </div>
      </div>
    );
  } else {
    //　それ以外の表示(空のdivタグ)
    return <div></div>;
  }
};

export default Room;