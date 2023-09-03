# Simple NFT dApp backend
This folder contains the backend code for Simple NFT dApp

## How to run 
1. First, add your credentials in `.env.sample` and rename it to .env. 
```.env
RPC_URL= i.e. localhost:PORT or Your Blockchain Node Provider URL
ACCOUNT= i.e. Your Sepolia Ethereum account address
PRIVATE_KEY= i.e. Your private key
```
2. Run the following script
```
npm install
npm run start or npm run start:dev on local
```

## How to test
This code has been deployed to Heroku. You can test it by calling the API below:
```
To mint your NFT:
curl -X POST -d "recipient"="Your Sepolia Ethereum account address" https://https://simplenft-api-b11f0d93b70a.herokuapp.com/mint

To get a NFT detail:
curl -X POST -d "userAddress"="Your Sepolia Ethereum account address" https://https://simplenft-api-b11f0d93b70a.herokuapp.com/details

To get a receipt of your NFT:
curl -X POST -d "userAddress"="Your Sepolia Ethereum account address" https://https://simplenft-api-b11f0d93b70a.herokuapp.com/receipts
```

## (Optional) Heroku Deployment via CLI
The idea here is that you have a single git repository, but multiple Heroku apps. In other words, you want to share a single git repository to power multiple Heroku apps. So, for each app you need this buildpack, and for each app, you need to set a config variable named PROCFILE to the location where the procfile is for that app. Here's [ref](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-multi-procfile). 

```sh
$ heroku login
$ heroku create -a simplenft-api

$ heroku buildpacks:add -a simplenft-api heroku-community/multi-procfile
$ heroku buildpacks:add -a simplenft-api heroku/nodejs

$ heroku config:set -a simplenft-api SERVER_ENV=true
$ heroku config:set -a simplenft-api PROCFILE=backend/Procfile

Then push to Heroku's repo for deployment
$ git push https://git.heroku.com/simplenft-api.git HEAD:master

Here's tutorial:
https://towardsdev.com/deploying-a-monorepo-to-heroku-74c0d5a1f79e
```