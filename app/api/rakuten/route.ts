import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keyword = body.keyword?.trim();

    if (!keyword) {
      return NextResponse.json(
        { error: "キーワードが必要です" },
        { status: 400 },
      );
    }

    const appId = process.env.RAKUTEN_APP_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;

    if (!appId) {
      return NextResponse.json(
        { error: "RAKUTEN_APP_IDが設定されていません" },
        { status: 500 },
      );
    }

    const url =
      `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?format=json&keyword=%E6%A5%BD%E5%A4%A9&genreId=0&applicationId=b90d08f0-fdae-4d6c-92a3-8c1b8ae62b3f&accessKey=pk_95cyALE0VDs7M2dhNjwPzeT2qMTv64DHMEuvSRGzyOt` +
      `?applicationId=${appId}` +
      `&accessKey=${accessKey}` +
      `&keyword=${encodeURIComponent(keyword)}` +
      `&hits=20` +
      `&formatVersion=2`;

    const response = await fetch(url);

    const data = await response.json();

    console.log("楽天APIレスポンス");
    console.log(JSON.stringify(data, null, 2));
    console.log("APP_ID:", process.env.RAKUTEN_APP_ID);
    console.log("ACCESS_KEY:", accessKey);
    console.log("STATUS", response.status);
    console.log("URL", url);

    const items = data.Items || [];

    const formatted = items
      .map((item: any) => item.Item.itemName)
      .filter(Boolean)
      .map((name: string) => name.replace(keyword, "").trim())
      .filter((name: string) => name.length > 0)
      .filter(
        (item: string, index: number, self: string[]) =>
          self.indexOf(item) === index,
      )
      .slice(0, 10);

    return NextResponse.json({
      results: formatted,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
