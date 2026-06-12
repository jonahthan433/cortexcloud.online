#!/bin/bash
# Fallback wrapper in case the hosting provider serves this file statically instead of redirecting.
curl -fsSL https://raw.githubusercontent.com/jonahthan433/CortexOS/main/scripts/install.sh | bash
