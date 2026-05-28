"use client";
import { useState } from "react";
export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      setResults(data.results || []);
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
