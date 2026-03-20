#!/bin/bash
# End-to-end test script for ModelGate
# Requires backend running on localhost:8000

set -e
BASE="http://localhost:8000"
PASS=0
FAIL=0

test_endpoint() {
    local desc="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected="$5"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    status=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')

    if [ "$status" = "$expected" ]; then
        echo "PASS: $desc (HTTP $status)"
        PASS=$((PASS + 1))
    else
        echo "FAIL: $desc (expected HTTP $expected, got $status)"
        echo "  Body: $(echo "$body" | head -1)"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== ModelGate End-to-End Tests ==="
echo ""

# Health
test_endpoint "Health check" GET "/health" "" "200"

# Customers
test_endpoint "List customers" GET "/customers" "" "200"
test_endpoint "Get ACME customer" GET "/customers/acme-support" "" "200"
test_endpoint "Get Globex customer" GET "/customers/globex-claims" "" "200"
test_endpoint "Get nonexistent customer" GET "/customers/nonexistent" "" "404"

# Logs
test_endpoint "Get ACME logs" GET "/logs/acme-support" "" "200"
test_endpoint "Get ACME stats" GET "/stats/acme-support" "" "200"

# Proxy - simple query
test_endpoint "Proxy simple query" POST "/v1/acme-support/chat/completions" \
    '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}' "200"

# Proxy - nonexistent customer
test_endpoint "Proxy nonexistent customer" POST "/v1/nonexistent/chat/completions" \
    '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}' "404"

# Extraction (JSON)
test_endpoint "Extract from text" POST "/extract" \
    '{"customer_name":"Test Corp","contract_text":"Simple test contract for a US-based chatbot.","custom_instructions":""}' "200"

# Cleanup test customer
test_endpoint "Delete test customer" "DELETE" "/customers/test-corp" "" "200"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
