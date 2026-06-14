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

    if (!appId) {
      return NextResponse.json(
        { error: "RAKUTEN_APP_IDが設定されていません" },
        { status: 500 },
      );
    }

    const url =
      `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601` +
      `?applicationId=${appId}` +
      `&keyword=${encodeURIComponent(keyword)}` +
      `&hits=20`;

    const response = await fetch(url);

    const data = await response.json();

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
