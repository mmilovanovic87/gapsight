#!/bin/bash
# GapSight Language Policy Enforcement Script
# Runs in CI before build. Fails if forbidden phrases found in locale files.
# Usage: LOCALE_DIR=src/locales bash scripts/check-language-policy.sh

LOCALE_DIR="${LOCALE_DIR:-src/locales}"
POLICY_FILE="${POLICY_FILE:-config/language-policy.json}"
FAILED=0

if [ ! -f "$POLICY_FILE" ]; then
  echo "ERROR: Language policy file not found: $POLICY_FILE"
  exit 1
fi

if [ ! -d "$LOCALE_DIR" ]; then
  echo "ERROR: Locale directory not found: $LOCALE_DIR"
  exit 1
fi

echo "Checking language policy in: $LOCALE_DIR"
echo "Policy file: $POLICY_FILE"
echo "---"

# Extract forbidden phrases using node (avoids jq dependency)
FORBIDDEN=$(node -e "
  const p = require('./' + process.argv[1]);
  p.forbidden.forEach(f => console.log(f));
" "$POLICY_FILE" 2>/dev/null)

if [ -z "$FORBIDDEN" ]; then
  echo "ERROR: Could not read forbidden phrases from $POLICY_FILE"
  exit 1
fi

while IFS= read -r phrase; do
  matches=$(grep -rni "$phrase" "$LOCALE_DIR" 2>/dev/null)
  if [ -n "$matches" ]; then
    echo "LANGUAGE POLICY VIOLATION: '$phrase'"
    echo "$matches"
    echo "Fix: update string in $LOCALE_DIR/en.json"
    echo "---"
    FAILED=1
  fi
done <<< "$FORBIDDEN"

EXPORT_TEMPLATE_DIR="${EXPORT_TEMPLATE_DIR:-src/templates}"
if [ -d "$EXPORT_TEMPLATE_DIR" ]; then
  REQUIRED=$(node -e "
    const p = require('./' + process.argv[1]);
    p.required_in_exports.forEach(f => console.log(f));
  " "$POLICY_FILE" 2>/dev/null)

  while IFS= read -r phrase; do
    matches=$(grep -rli "$phrase" "$EXPORT_TEMPLATE_DIR" 2>/dev/null)
    if [ -z "$matches" ]; then
      echo "LANGUAGE POLICY VIOLATION: required phrase '$phrase' missing from export templates"
      echo "---"
      FAILED=1
    fi
  done <<< "$REQUIRED"
fi

if [ $FAILED -eq 1 ]; then
  echo "Language policy check FAILED."
  exit 1
fi
echo "Language policy check PASSED."
exit 0
