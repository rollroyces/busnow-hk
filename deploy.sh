#!/usr/bin/env bash
# Create the busnow-hk GitHub repo, push source, and let GitHub Actions
# handle the build + Pages deploy via .github/workflows/deploy.yml.
#
# Run after `gh auth login`. The PAT used must have `repo` and `workflow` scopes.
set -euo pipefail

REPO_NAME="${BUSNOW_REPO:-busnow-hk}"
VISIBILITY="${BUSNOW_VISIBILITY:-public}"
DESCRIPTION="Real-time Hong Kong bus arrivals (KMB, LWB, Citybus) — PWA, mobile-first."

cd "$(dirname "$0")"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install: https://cli.github.com/  (brew install gh)"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Not authenticated. Run: gh auth login"
  exit 1
fi

USER=$(gh api user -q .login)
echo "Authenticated as: $USER"

# Create repo if it doesn't exist
if ! gh repo view "$USER/$REPO_NAME" >/dev/null 2>&1; then
  echo "Creating $VISIBILITY repo $USER/$REPO_NAME..."
  gh repo create "$REPO_NAME" --"$VISIBILITY" --description "$DESCRIPTION" --add-readme
else
  echo "Repo $USER/$REPO_NAME already exists."
fi

# Add remote if needed
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/$USER/$REPO_NAME.git"
fi

# Push
echo "Pushing source to origin/main..."
git push -u origin main

# Configure Pages to use GitHub Actions as the source
echo "Configuring GitHub Pages (Actions source)..."
gh repo edit "$REPO_NAME" --enable-pages --pages-build-type workflow >/dev/null 2>&1 || \
  echo "(Note: you may need to enable Pages in repo Settings → Pages → Source: GitHub Actions)"

# Trigger the workflow (it also runs on push, but this is explicit)
echo "Triggering deploy workflow..."
gh workflow run deploy.yml --repo "$USER/$REPO_NAME" || echo "(workflow will run on push anyway)"

echo ""
echo "Done! Watch the deploy:"
echo "  gh run watch --repo $USER/$REPO_NAME"
echo ""
echo "Once the workflow finishes (1-2 min), the site will be live at:"
echo "  https://$USER.github.io/$REPO_NAME/"
