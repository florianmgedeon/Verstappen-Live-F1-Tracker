#!/bin/bash

# ----------------------------
# Paths
# ----------------------------
DIR="mock-data"
INTERVALS="$DIR/intervals.json"
POSITIONS="$DIR/position.json"
LAPS="$DIR/laps.json"
STINTS="$DIR/stints.json"

# ----------------------------
# Reset and initialize
# ----------------------------
mkdir -p "$DIR"
echo "[" > "$INTERVALS"
echo "[" > "$POSITIONS"
echo "[" > "$LAPS"
echo "[" > "$STINTS"

lap=1
start_time=$(date +%s)
runtime_limit=$((5 * 60))  # 5 minutes in seconds

first_write_intervals=true
first_write_positions=true
first_write_laps=true
first_write_stints=true

# ----------------------------
# Append valid JSON object to array file
# ----------------------------
append_json() {
  local file=$1
  local new_object=$2
  local first_write_flag_name=$3

  # Get the current value of the first-write flag using indirect reference
  local is_first_write=${!first_write_flag_name}

  if [ "$is_first_write" = false ]; then
    # Remove closing bracket
    sed -i '' '$d' "$file"
    # Add comma to previous line
    sed -i '' -e '$ s/$/,/' "$file"
  fi

  echo "  $new_object" >> "$file"
  echo "]" >> "$file"

  # Dynamically change the flag to false
  eval "$first_write_flag_name=false"
}

# ----------------------------
# Simulation loop
# ----------------------------
echo "🚦 Starting 5-minute F1 simulation..."
while true; do
  now=$(date +%s)
  elapsed=$((now - start_time))
  if (( elapsed >= runtime_limit )); then
    echo "🏁 Simulation complete! 5 minutes are up."
    break
  fi

  echo "Lap $lap..."

  # Generate values with dot as decimal separator
  GAP=$(LC_NUMERIC=C awk -v min=0 -v max=5 'BEGIN{srand(); print min+rand()*(max-min)}')
  INTERVAL=$(LC_NUMERIC=C awk -v min=0 -v max=1 'BEGIN{srand(); print min+rand()*(max-min)}')
  POS=$(( (RANDOM % 3) + 1 ))
  LAPTIME=$(LC_NUMERIC=C awk -v min=95 -v max=99 'BEGIN{srand(); print min+rand()*(max-min)}')

  append_json "$INTERVALS" "{ \"gap_to_leader\": $GAP, \"interval\": $INTERVAL }" first_write_intervals
  append_json "$POSITIONS" "{ \"position\": $POS }" first_write_positions
  append_json "$LAPS" "{ \"lap_number\": $lap, \"lap_duration\": $LAPTIME }" first_write_laps

  if [ "$lap" -eq 10 ]; then
    append_json "$STINTS" "{ \"lap_start\": 10, \"tyre_age_at_start\": 0, \"compound\": \"MEDIUM\" }" first_write_stints
  fi

  lap=$((lap + 1))
  sleep 5
done
