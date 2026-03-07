#!/bin/bash
# Test suite for check-language-policy.sh
# Run before check-language-policy.sh in CI pipeline.
# Usage: bash scripts/test-language-policy.sh

FAILED=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/check-language-policy.sh"
POLICY_FILE="${POLICY_FILE:-config/language-policy.json}"
TMPDIR=$(mktemp -d)

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "Running language policy script tests..."
echo "---"

# Test 1: forbidden phrase should cause failure
mkdir -p "$TMPDIR/test1/locales"
echo '{"ui": {"title": "compliance platform"}}' > "$TMPDIR/test1/locales/en.json"

LOCALE_DIR="$TMPDIR/test1/locales" \
POLICY_FILE="$POLICY_FILE" \
bash "$CHECK_SCRIPT" > /dev/null 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "FAIL Test 1: Script should have detected forbidden phrase 'compliance platform'"
  FAILED=1
else
  echo "PASS Test 1: Forbidden phrase correctly detected"
fi

# Test 2: clean file should pass
mkdir -p "$TMPDIR/test2/locales"
echo '{"ui": {"title": "informative self-assessment tool"}}' > "$TMPDIR/test2/locales/en.json"

LOCALE_DIR="$TMPDIR/test2/locales" \
POLICY_FILE="$POLICY_FILE" \
bash "$CHECK_SCRIPT" > /dev/null 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "FAIL Test 2: Clean file should have passed"
  FAILED=1
else
  echo "PASS Test 2: Clean file correctly passed"
fi

# Test 3: another forbidden phrase
mkdir -p "$TMPDIR/test3/locales"
echo '{"ui": {"cta": "certify your compliance today"}}' > "$TMPDIR/test3/locales/en.json"

LOCALE_DIR="$TMPDIR/test3/locales" \
POLICY_FILE="$POLICY_FILE" \
bash "$CHECK_SCRIPT" > /dev/null 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "FAIL Test 3: Script should have detected 'certify your compliance'"
  FAILED=1
else
  echo "PASS Test 3: Second forbidden phrase correctly detected"
fi

# Test 4: missing policy file should error
LOCALE_DIR="$TMPDIR/test2/locales" \
POLICY_FILE="/nonexistent/policy.json" \
bash "$CHECK_SCRIPT" > /dev/null 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "FAIL Test 4: Script should fail when policy file is missing"
  FAILED=1
else
  echo "PASS Test 4: Missing policy file correctly detected"
fi

echo "---"
if [ $FAILED -eq 1 ]; then
  echo "Language policy test suite FAILED."
  exit 1
fi
echo "Language policy test suite PASSED. (4/4)"
exit 0
