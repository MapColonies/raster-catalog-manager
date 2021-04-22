# Raster Catalog Manager Service

A manager service that exposes CUD (Create, Update and Delete) operations into catalog database. 
this service will manage the raster profiles (Best Mosaic. Discrete, etc.)
The Orm DB schema will be generated from @mc-models

# Notes
The Discovery (Read) operations by consumers will be against csw protocol of our pyCsw catalog - NOT this service

run ```npm run release -- --release-as <version>``` to prevent double bumping and follow release instructions.
