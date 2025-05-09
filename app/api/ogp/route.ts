import { NextRequest, NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const { result } = await ogs({ url, timeout: 5000 }); // タイムアウトを5秒に設定
    
    if (result.success) {
      // OGP画像が配列の場合でも最初の有効なURLを選択
      let imageUrl: string | null = null;
      if (result.ogImage) {
        if (Array.isArray(result.ogImage)) {
          // 配列の場合、最初の有効な画像URLを取得
          const firstValidImage = result.ogImage.find(img => typeof img?.url === 'string');
          if (firstValidImage) {
            imageUrl = firstValidImage.url;
          }
        } else {
          // urlプロパティを確認して取得
          const ogImg = result.ogImage as { url?: string };
          if (typeof ogImg?.url === 'string') {
            imageUrl = ogImg.url;
          }
        }
      }

      return NextResponse.json({
        title: result.ogTitle,
        description: result.ogDescription,
        image: imageUrl,
        siteName: result.ogSiteName,
      });
    } else {
      console.error('OGS error:', result.error);
      return NextResponse.json({ error: 'Failed to fetch OGP data from the source', details: result.error }, { status: 502 });
    }
  } catch (error: any) {
    console.error('Error fetching OGP data in API route:', error);
    return NextResponse.json({ error: 'Internal server error while fetching OGP data', details: error.message }, { status: 500 });
  }
} 