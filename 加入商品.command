#!/bin/bash
# 雙擊這個檔案 → 貼上日本 Amazon 商品網址 → 自動產生一頁式網站並開啟。
cd "$(dirname "$0")" || exit 1

URL=$(osascript -e 'try
  set r to display dialog "貼上日本 Amazon 商品網址（可一次貼多行）" default answer "https://www.amazon.co.jp/dp/" with title "🌸 加入商品" buttons {"取消", "產生"} default button "產生"
  return text returned of r
on error
  return ""
end try')

if [ -z "$URL" ]; then
  echo "已取消。"
  read -n 1 -s -r -p "按任意鍵關閉…"
  exit 0
fi

echo "🌸 開始產生一頁式網站…"
URLS=()
while IFS= read -r line; do
  line="$(printf '%s' "$line" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [ -n "$line" ] && URLS+=("$line")
done <<< "$URL"

if [ ${#URLS[@]} -eq 0 ]; then
  echo "沒有收到有效網址。"
  read -n 1 -s -r -p "按任意鍵關閉…"
  exit 1
fi

node generate.mjs "${URLS[@]}" --open

echo ""
echo "完成！網站位置：$(pwd)/site/index.html"
read -n 1 -s -r -p "按任意鍵關閉…"
