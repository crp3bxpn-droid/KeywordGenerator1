"use client";
import { useState } from "react";
export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [mode, setMode] = useState("google");
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      let results: string[] = [];

      if (mode === "google") {
        const response = await fetch("/api/suggest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword }),
        });

        const data = await response.json();
        results = data.results || [];
      }

      if (mode === "rakuten") {
        const response = await fetch("/api/rakuten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword }),
        });

        const data = await response.json();
        results = data.results || [];
      }

      if (mode === "both") {
        const [googleRes, rakutenRes] = await Promise.all([
          fetch("/api/suggest", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ keyword }),
          }),

          fetch("/api/rakuten", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ keyword }),
          }),
        ]);

        const googleData = await googleRes.json();
        const rakutenData = await rakutenRes.json();

        results = [
          ...new Set([
            ...(googleData.results || []),
            ...(rakutenData.results || []),
          ]),
        ];
      }

      setResults(results);
    } catch (error) {
      console.error(error);
      alert("取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = () => {
    const blob = new Blob([results.join("\n")], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <main style={{ maxWidth: 600, margin: "80px auto", padding: 20 }}>
      {" "}
      <h1 style={{ marginBottom: 24 }}> SEOキーワード抽出ツール </h1>{" "}
      <div className="mb-4 flex gap-4">
        <label>
          <input
            type="radio"
            value="google"
            checked={mode === "google"}
            onChange={(e) => setMode(e.target.value)}
          />
          Google
        </label>

        <label>
          <input
            type="radio"
            value="rakuten"
            checked={mode === "rakuten"}
            onChange={(e) => setMode(e.target.value)}
          />
          楽天
        </label>
      </div>
      <input
        type="text"
        placeholder="キーワードを入力"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: "100%", padding: 12, fontSize: 16, marginBottom: 16 }}
      />{" "}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ padding: "12px 20px", cursor: "pointer", marginBottom: 24 }}
      >
        {" "}
        {loading ? "取得中..." : "キーワード生成"}{" "}
      </button>{" "}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 16,
          minHeight: 200,
          marginBottom: 24,
        }}
      >
        {" "}
        {results.length === 0 ? (
          <p>検索結果が表示されます</p>
        ) : (
          results.map((item, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              {" "}
              {item}{" "}
            </div>
          ))
        )}{" "}
      </div>{" "}
      {results.length > 0 && (
        <button
          onClick={handleDownload}
          style={{ padding: "12px 20px", cursor: "pointer" }}
        >
          {" "}
          TXTダウンロード{" "}
        </button>
      )}{" "}
    </main>
  );
}
