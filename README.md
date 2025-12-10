# 📺 YouTube Clone – Full-Stack Video Platform

YouTube-like video platform built with Next.js, tRPC, Drizzle ORM, and modern streaming infra using Mux. 
Includes full social features: comments, reactions, subscriptions, playlists, history, trending, and more. 
This project aims to replicate the core UX/UI of YouTube while implementing a clean, scalable, and production-ready architecture.

## Live Demo / Preview
https://mytube-j2gq.vercel.app/


## 🚀 Tech Stack

### Frontend
- Next.js 15 – App Router, server actions
- TailwindCSS – utility-first styling
- ShadCN/UI – accessible UI components
- tRPC Client – typesafe communication with the backend.
- Mux Player – smooth, high-quality video playback in the browser.
- UploadThing Dropzone – client-side file selection and upload UI.

### Backend
- tRPC Routers – fully typesafe backend API routes.
- Drizzle ORM – typed SQL schema, migrations, and database queries.
- Neon PostgreSQL – cloud-hosted serverless PostgreSQL database.
- Mux Upload API & Webhooks – video uploading, processing, and encoding pipeline.
- Upstash – background job
- UploadThing Server Handlers – secure server-side file handling.
- OpenAI API – generates title, description, and thumbnail




## Features

### Video System
- Upload video via Mux
- upload custom thumbnail via uploadthing
- Auto-generated: Thumbnail, Title, Description (via OpenAI) 
- HD streaming using Mux Player
- View count tracking (server-side)

### Home page
- Category filtering
- Search system
- Adaptive layout (grid responsive like YouTube)

### Trending Page
- Video ranking based on: Views, interactivity(comments and likes) and more

### Liked Videos page
- Videos user has reacted “Like” to
- Sorted by activity timestamp

### Playlist System
- Create & manage playlists
- Add/remove any video
- Privacy mode (public / private)
- Playlist page with video list

### Subscribe System
- Subscribe / unsubscribe to creators
- Subscription page with videos from subscribed channels

### History page
- Video watch history
- Fully synced with server events
- Auto-append when user watches video
- clear or remove any video in the page history

### Video Reactions
- Like / dislike per video
- Total global counts

### Authentication
- sign-in / sign-up feature powered by clerk
- protected pages (requires login)
- Protected routes with strict ownership access control



## Project structure
```bash
  app/                 # Next.js App Router
    api/               # Webhooks, tRPC handlers, server endpoints

  src/
    components/        # Reusable UI components
    db/                # Drizzle ORM schema & database utilities
    lib/               # Reusable utilities & helpers
    modules            # Self-contained feature modules used by App Router pages

```


## Database schema (Drizzle)
- users
- videos
- categories
- view count
- history
- subscriptions
- like
- dislike
- comments
- comments like count
- comments dislike count
- playlist
- playlist videos



## API – tRPC Routers
- categoriesRouter
- authRouter
- userRouter
- studioRouter
- videoRouter
- ViewCountRouter
- subscriptionsRouter
- reactionRouter
- commentsRouter
- commentsReactionRouter
- historyRouter
- playlistRouter



## Future Improvements
- Live streaming (Mux Live)
- Notifications system
- Channel monetization
- Multi-language subtitles using Whisper



## Getting Started

1. Clone the repositor
```bash
- git clone https://github.com/<hamzah-sama>/<mytube>
- cd mytube
```

2. Install dependencies
```bash
npm instal
```

3. Set environment variables
- Create a .env file and fill in all required keys:

```bash
- DATABASE_URL= 
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- CLERK_WEBHOOK_SIGNING_SECRET
- MUX_TOKEN_ID=
- MUX_TOKEN_SECRET=
- MUX_WEBHOOK_SECRET=
- UPLOADTHING_TOKEN=
- QSTASH_URL=
- QSTASH_TOKEN=
- QSTASH_CURRENT_SIGNING_KEY=
- QSTASH_NEXT_SIGNING_KEY=
- OPENAI_API_KEY=
- WORKFLOW_BASE_URL = 'http://localhost:3000'
```


4. run database push
```bash
npm run drizzle-kit push
```

5. Start the development server
```bash
npm run dev
```
