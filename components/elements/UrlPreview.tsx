"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface OgpData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface UrlPreviewProps {
  url: string;
}

const UrlPreview: React.FC<UrlPreviewProps> = ({ url }) => {
  const [ogp, setOgp] = useState<OgpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOgp = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch OGP: ${response.status}`
          );
        }
        const data: OgpData = await response.json();
        setOgp(data);
      } catch (err: any) {
        console.error("Error fetching OGP data for", url, err);
        setError(err.message || "OGPデータの取得に失敗しました。");
        setOgp(null); // エラー時はOGPデータをクリア
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchOgp();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="my-2 p-3 border border-gray-200 rounded-lg bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // エラー時
  if (error || !ogp || (!ogp.title && !ogp.image && !ogp.description)) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-2 block border border-gray-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white no-underline text-gray-800"
    >
      {ogp.image && (
        <div className="relative w-full h-32 sm:h-40 bg-gray-100">
          {" "}
          {/* 画像コンテナの高さ調整 */}
          <Image
            src={ogp.image}
            alt={ogp.title || "OGP Image"}
            layout="fill"
            objectFit="cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-3">
        {ogp.siteName && (
          <p className="text-xs text-gray-500 truncate mb-1">{ogp.siteName}</p>
        )}
        {ogp.title && (
          <h4 className="text-sm font-semibold text-gray-700 truncate mb-1 leading-tight">
            {ogp.title}
          </h4>
        )}
        {ogp.description && (
          <p className="text-xs text-gray-600 leading-snug max-h-16 overflow-hidden relative">
            {/* 3行までの表示制限とグラデーションでの省略表現 */}
            <span className="line-clamp-3">{ogp.description}</span>
          </p>
        )}
      </div>
    </a>
  );
};

export default UrlPreview;
