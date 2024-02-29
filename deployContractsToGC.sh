#!/bin/bash

# Function to load environment variables from file
load_env() {
    if [ -f "$1" ]; then
        echo "Loading environment variables from $1"
        export $(cat "$1" | sed 's/#.*//g' | xargs)
    else
        echo "Error: Environment file $1 not found."
        exit 1
    fi
}

# Check if an environment file was supplied as an argument
if [ $# -eq 0 ]; then
    # No arguments supplied, default to .env if it exists
    if [ -f ".env" ]; then
        load_env ".env"
    else
        echo "No environment file supplied and default .env file not found."
        # It's not mandatory to exit here if you have defaults in the script
    fi
else
    # Load the specified environment file
    load_env "$1"
fi

cd packages/circles-contracts-v2/src

# Deploy the v2 contracts using `forge create`
echo "Deploying V2 Hub ..."
cd hub
V2_HUB_V1_HUB=${V1_HUB_ADDRESS}
V2_DEMURRAGE_ZERO_DAY="${V2_DEMURRAGE_ZERO_DAY}"
V2_HUB_STANDARD_TREASURY="${V2_HUB_STANDARD_TREASURY}"
V2_HUB_BOOTSTRAP_TIME="${V2_HUB_BOOTSTRAP_TIME}" # 180 days
V2_HUB_FALLBACK_URL="${V2_HUB_FALLBACK_URL}"

V2_HUB_DEPLOYMENT=$(forge create Hub \
  --rpc-url ${RPC_URL} \
  --private-key ${PRIVATE_KEY} \
  --constructor-args ${V2_HUB_V1_HUB} ${V2_DEMURRAGE_ZERO_DAY} ${V2_HUB_STANDARD_TREASURY} ${V2_HUB_BOOTSTRAP_TIME} ${V2_HUB_FALLBACK_URL} \
  --verify \
  --verifier-url https://api.gnosisscan.io/api? \
  --verifier etherscan \
  --etherscan-api-key ${ETHERSCAN_API_KEY})
V2_HUB_ADDRESS=$(echo "$V2_HUB_DEPLOYMENT" | grep "Deployed to:" | awk '{print $3}')
echo "V2 Hub deployed at ${V2_HUB_ADDRESS}"

CTOR_ARGS=$(cast abi-encode "constructor(address,uint256,address,uint256,string)" \
  ${V2_HUB_V1_HUB} \
  ${V2_DEMURRAGE_ZERO_DAY} \
  ${V2_HUB_STANDARD_TREASURY} \
  ${V2_HUB_BOOTSTRAP_TIME} \
  ${V2_HUB_FALLBACK_URL})
echo "CTOR_ARGS: $CTOR_ARGS"

echo ""
echo "Summary:"
echo "========"
echo "V1 Hub: $V1_HUB_ADDRESS"
echo "V2 Hub: $V2_HUB_ADDRESS"
echo ""
