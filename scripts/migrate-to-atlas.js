/**
 * Script to migrate data from local MongoDB to MongoDB Atlas
 * Usage: node scripts/migrate-to-atlas.js
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/nexttransport'
const ATLAS_URI = process.env.MONGODB_URI

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set')
  console.error('Please set it in your .env.local file or export it:')
  console.error('export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/nexttransport"')
  process.exit(1)
}

async function migrate() {
  let localConn, atlasConn

  try {
    console.log('📦 Connecting to local MongoDB...')
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise()
    console.log('✅ Connected to local MongoDB')

    console.log('☁️  Connecting to MongoDB Atlas...')
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise()
    console.log('✅ Connected to MongoDB Atlas')

    // Get all collections from local
    const localDb = localConn.db
    const collections = await localDb.listCollections().toArray()
    
    console.log(`\n📊 Found ${collections.length} collections to migrate:`)
    collections.forEach(col => console.log(`   - ${col.name}`))

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      console.log(`\n🔄 Migrating collection: ${collectionName}`)

      const localCollection = localDb.collection(collectionName)
      const atlasCollection = atlasConn.db.collection(collectionName)

      // Get all documents
      const documents = await localCollection.find({}).toArray()
      console.log(`   Found ${documents.length} documents`)

      if (documents.length > 0) {
        // Clear existing data in Atlas (optional - remove --drop flag if you want to keep existing)
        await atlasCollection.deleteMany({})
        console.log(`   Cleared existing data in Atlas`)

        // Insert documents
        await atlasCollection.insertMany(documents)
        console.log(`   ✅ Inserted ${documents.length} documents into Atlas`)

        // Copy indexes
        const indexes = await localCollection.indexes()
        for (const index of indexes) {
          if (index.name !== '_id_') {
            try {
              await atlasCollection.createIndex(index.key, {
                unique: index.unique,
                sparse: index.sparse,
                background: true,
              })
              console.log(`   ✅ Created index: ${index.name}`)
            } catch (err) {
              console.log(`   ⚠️  Index ${index.name} already exists or error: ${err.message}`)
            }
          }
        }
      } else {
        console.log(`   ⏭️  No documents to migrate`)
      }
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📋 Summary:')
    for (const collectionInfo of collections) {
      const atlasCollection = atlasConn.db.collection(collectionInfo.name)
      const count = await atlasCollection.countDocuments()
      console.log(`   ${collectionInfo.name}: ${count} documents`)
    }

  } catch (error) {
    console.error('\n❌ Migration error:', error.message)
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Troubleshooting:')
      console.error('   1. Verify your MongoDB Atlas username and password are correct')
      console.error('   2. Make sure your IP address is whitelisted in Atlas Network Access')
      console.error('   3. Check that the database user exists and has proper permissions')
      console.error('   4. If password contains special characters, try URL encoding them')
    }
    process.exit(1)
  } finally {
    if (localConn) await localConn.close()
    if (atlasConn) await atlasConn.close()
    console.log('\n🔌 Disconnected from databases')
  }
}

migrate()
