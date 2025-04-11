#!/bin/bash

# ----------------------------
# Paths
# ----------------------------
DIR="mock-data"
INTERVALS="$DIR/intervals.json"
POSITIONS="$DIR/position.json"
LAPS="$DIR/laps.json"
STINTS="$DIR/stints.json"
CAR_DATA="$DIR/car_data.json"

# ----------------------------
# Reset and initialize
# ----------------------------
mkdir -p "$DIR"
echo "[" > "$INTERVALS"
echo "[" > "$POSITIONS"
echo "[" > "$LAPS"
echo "[" > "$STINTS"
echo "[" > "$CAR_DATA"

lap=1
start_time=$(date +%s)
runtime_limit=$((5 * 60))  # 5 minutes in seconds

first_write_intervals=true
first_write_positions=true
first_write_laps=true
first_write_stints=true
first_write_car_data=true

# ----------------------------
# Append valid JSON object to array file
# ----------------------------
append_json() {
  local file=$1
  local new_object=$2
  local first_write_flag_name=$3

  local is_first_write=${!first_write_flag_name}

  if [ "$is_first_write" = false ]; then
    # Remove closing bracket
    sed -i '' '$d' "$file"
    # Add comma to previous line
    sed -i '' -e '$ s/$/,/' "$file"
  fi

  echo "  $new_object" >> "$file"
  echo "]" >> "$file"

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

  # Generate values
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

  # Generate 10 car_data entries over the next 5 seconds
  for i in {1..10}; do
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    BRAKE=$(( RANDOM % 2 ))
    THROTTLE=$(( 90 + RANDOM % 10 ))
    N_GEAR=$(( 1 + RANDOM % 8 ))
    RPM=$(( 8000 + RANDOM % 4000 ))
    SPEED=$(( 250 + RANDOM % 80 ))

    car_data_entry=$(cat <<EOF
{
  "brake": $BRAKE,
  "date": "$TIMESTAMP",
  "driver_number": 55,
  "drs": 12,
  "meeting_key": 1219,
  "n_gear": $N_GEAR,
  "rpm": $RPM,
  "session_key": 9159,
  "speed": $SPEED,
  "throttle": $THROTTLE
}
EOF
)
    append_json "$CAR_DATA" "$car_data_entry" first_write_car_data
    sleep 0.5
  done

  lap=$((lap + 1))
done
