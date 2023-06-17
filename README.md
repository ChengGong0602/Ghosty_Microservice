# MicroService for houdiniswap Token price quoting

### Used platform

- FixedFloat
- ChangeNow
- SimpleSwap
- StealthEx

## deploying 
sls deploy -s prod
npx serverless deploy -s prod

## testing on local
`create the env file env/prod.json` (see sample-env.json)
`npm run test`