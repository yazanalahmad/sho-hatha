#!/usr/bin/env bash
set -euo pipefail

cat >/tmp/board-pack.json <<'JSON'
{"team1CategoryIds":["9440a0db-ac8b-4665-bee5-cfb5c316dc95","3cb5db4f-bd67-4adf-83e1-c27d0cd33e76","00dda1e6-1f7a-459d-85d0-e84c8f033c50"],"team2CategoryIds":["cd74560a-034e-46ff-b7b6-00c6a62f3660","7b2c1d40-073f-492b-bd85-a1fcb1d88a93","e18528d0-8c97-413c-976d-8004a7c9f7f5"]}
JSON

echo "--- payload ---"
cat /tmp/board-pack.json

echo
echo "--- request ---"
curl -i -X POST "http://localhost:3001/api/game-packs/generate-board" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/board-pack.json
