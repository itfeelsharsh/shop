# Firebase Indexes Setup Guide

This document provides instructions for setting up the required Firebase Firestore indexes for the KamiKoto Shop application.

## Required Composite Indexes

The following composite indexes are required for proper application functionality:

### 1. Announcements Collection

The application needs a composite index for queries that filter and sort announcements:

- **Collection**: `announcements`
- **Fields to index**: 
  - `active` (Ascending)
  - `priority` (Descending)

### How to Create the Index

1. **Automatic Method (Recommended)**:
   - Open the Firebase console error link that appears in your browser console
   - Click the "Create Index" button on the Firebase console page that opens
   - Firebase will automatically configure the index with the correct fields

2. **Manual Method**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Firestore Database > Indexes tab
   - Click "Add Index"
   - Fill in the following details:
     - Collection ID: `announcements`
     - Fields:
       - `active` (Order: Ascending)
       - `priority` (Order: Descending)
     - Query scope: Collection
   - Click "Create"

## Other Potential Indexes

Depending on your usage, you may also need to create additional indexes for other complex queries in the application.

## Verifying Index Creation

After creating an index, Firebase will begin building it. This process can take anywhere from a few seconds to several minutes depending on the size of your collection.

You can check the status of your indexes in the Firebase Console under Firestore Database > Indexes.

## Temporary Workaround

The application has a built-in fallback mechanism for the announcements query that will work even without the index, but for optimal performance, it's recommended to create the proper indexes.

## Additional Resources

- [Firebase documentation on indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Understanding query limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations) 