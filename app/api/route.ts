import { NextRequest, NextResponse } from "next/server";
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
    const url =
      `https://suggestqueries.google.com/complete/search` +
      `?client=firefox` +
      `&hl=ja` +
      `&q=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    const data = await response.json();
    const suggestions: string[] = data[1] || [];
    const formatted = suggestions
      .map((item) => {
        return item.replace(`${keyword} `, "").trim();
      })
      .filter((item) => item.length > 0)
      .filter((item, index, self) => self.indexOf(item) === index)
      .slice(0, 10);
    return NextResponse.json({ results: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
