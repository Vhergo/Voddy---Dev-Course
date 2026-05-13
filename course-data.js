const PROJECT_ROOT = "{PROJECT_ROOT}";
const WEB_ROOT = `${PROJECT_ROOT}\\web`;

window.COURSE = {
  title: "Building and Understanding the VOD Review Bot",
  modules: [
    {
      id: "big-picture",
      title: "Big Picture",
      goal: "Understand what Voddy is, what each major process owns, and how data moves through the system.",
      lessons: [
        {
          title: "What This Project Does",
          summary: "Voddy is a Discord bot plus web app for BDO PvP VOD review: players submit videos, reviewers leave timestamped coaching, officers track review health, and future automation can scan for deaths.",
          concepts: [
            "A VOD is the central object. It stores player, guild, URL, event date, class/spec/role, K/D, visibility, review status, and death scan status.",
            "Feedback is subjective reviewer coaching. Death timestamps are objective markers. Drawings are visual annotations captured from the player UI.",
            "The Discord bot is fast for submissions and quick commands. The web app is better for deep review, filtering, stats, sessions, and video controls.",
            "The database is the shared memory between the Python bot and the Next.js website."
          ],
          unity: "Think of the project like a multiplayer Unity tool. Discord commands are one input device, the website is another input device, and SQLite is the save file. Both clients mutate the same world state.",
          walkthrough: [
            "Start with the README to see the intended product behavior.",
            "Open the Prisma schema and identify the models: Vod, Feedback, DeathTimestamp, DrawingMarker, Guild, AuthUser, GuildMembership, and DeathDetectionJob.",
            "Open the bot storage file and notice it creates many of the same tables directly in SQLite."
          ],
          files: [
            `${PROJECT_ROOT}\\README.md`,
            `${WEB_ROOT}\\prisma\\schema.prisma`,
            `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`
          ],
          exercise: "Draw a simple box diagram with four boxes: Discord user, bot process, web browser, SQLite database. Add arrows for submit VOD, open VOD page, add feedback, and queue death scan.",
          review: [
            "What data object is the center of the app?",
            "Why are feedback and death timestamps separate?",
            "Why does the bot need to know which guild/server it is in?"
          ]
        },
        {
          title: "Discord Bot vs Web App vs Database",
          summary: "The bot and website are separate programs. They do not call each other for normal review work; instead, they both read and write the same SQLite tables.",
          concepts: [
            "The bot runs Python and discord.py. It receives slash commands from Discord and writes rows with aiosqlite.",
            "The web app runs Next.js and TypeScript. It renders pages, receives form submissions, and writes rows through Prisma.",
            "Prisma schema is the TypeScript app's map of the database. Python storage manually creates and queries matching tables.",
            "Because two programs share a database, schema consistency matters. A new column usually needs both Prisma and Python awareness if the bot touches it."
          ],
          unity: "In Unity terms, the database is like persistent ScriptableObject/save data. The bot and web app are two different editor/runtime tools editing that same asset.",
          walkthrough: [
            "Compare `model Vod` in Prisma with `CREATE TABLE IF NOT EXISTS vods` in Python storage.",
            "Find `createVod` in `app/actions.ts` and `create_vod` in `storage.py`; both create a VOD row.",
            "Notice that web actions use `revalidatePath` because Next.js pages may cache rendered data."
          ],
          files: [
            `${WEB_ROOT}\\app\\actions.ts`,
            `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`,
            `${WEB_ROOT}\\lib\\prisma.ts`
          ],
          exercise: "Make a two-column note: left side lists bot responsibilities, right side lists web responsibilities. Put database responsibilities in the middle.",
          review: [
            "What does Prisma do for the web app?",
            "What does aiosqlite do for the bot?",
            "Why can the bot and website stay decoupled?"
          ]
        },
        {
          title: "Data Flow Through the System",
          summary: "A typical review starts with a VOD submission, moves to a VOD page, then accumulates feedback, deaths, drawings, replies, assignments, and status changes.",
          concepts: [
            "Submit flow: form/command validates inputs, creates a Vod row, assigns a player-specific VOD ID, then redirects or posts a Discord card.",
            "Review flow: VOD page loads the Vod row and related rows, passes data to a client component, and lets the reviewer add markers through server actions.",
            "Permission flow: OAuth or local dev session determines guild membership and reviewer/admin access.",
            "Refresh flow: after a mutation, server actions call `revalidatePath` so pages show fresh data."
          ],
          unity: "This resembles a gameplay loop: input command, validate rules, mutate authoritative state, then redraw UI from that new state.",
          walkthrough: [
            "Trace web submission from `VodSubmitForm` to `createVod`.",
            "Trace review markers from `VodDetailWorkspace` to `addFeedback`, `addDeath`, and `addDrawingMarker`.",
            "Trace Discord submission from `/vod submit` to `Storage.create_vod`."
          ],
          files: [
            `${WEB_ROOT}\\components\\vod-submit-form.tsx`,
            `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`,
            `${WEB_ROOT}\\app\\actions.ts`,
            `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`
          ],
          exercise: "Pick one action, such as Add Feedback, and write the exact data path: button/form -> action/function -> database table -> refreshed UI.",
          review: [
            "What does `revalidatePath` solve?",
            "Which row stores reviewer coaching?",
            "Which row stores automatic or manual death markers?"
          ]
        },
        {
          title: "Mental Model From Unity/C#",
          summary: "The web stack has different names, but many ideas map cleanly to Unity concepts you already know.",
          concepts: [
            "React component: reusable UI unit, similar to a prefab plus script, but rendered from data rather than scene hierarchy.",
            "Props: data passed into a component, similar to serialized fields or constructor parameters.",
            "State: component-owned changing data, similar to fields that affect rendering or behavior.",
            "Server component: code that runs on the server to fetch data and return UI. Client component: browser code that handles clicks, timers, local state, and video APIs.",
            "Server action: validated server-side mutation, similar to an authoritative command handler."
          ],
          unity: "The biggest difference is that the UI is recreated from data often. Instead of manually changing every visible object, React asks: what should the screen look like for the current state?",
          walkthrough: [
            "Open a server page like `app/page.tsx` and notice it is async and reads Prisma directly.",
            "Open a client component like `vod-detail-workspace.tsx` and notice `useState`, event handlers, and browser actions.",
            "Find the `'use client'` line. That marks code that must run in the browser."
          ],
          files: [
            `${WEB_ROOT}\\app\\page.tsx`,
            `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`,
            `${WEB_ROOT}\\components\\youtube-player.tsx`
          ],
          exercise: "Translate these web terms to your own Unity words: component, props, state, server action, route, model.",
          review: [
            "Why can a server component read from the database directly?",
            "Why does a video player need to be a client component?",
            "What is the closest Unity idea to props?"
          ]
        }
      ],
      quiz: [
        { q: "Which object is the center of Voddy's review workflow?", options: ["Vod", "GuildMembership", "OAuth state"], answer: 0 },
        { q: "Why do the bot and web app both work with the same VODs?", options: ["They share the SQLite database", "They share React components", "Discord sends data to Next.js automatically"], answer: 0 },
        { q: "Which marker type is objective and useful for future automation?", options: ["DeathTimestamp", "Feedback", "SiteAdmin"], answer: 0 }
      ],
      test: "Explain the whole project in five sentences without using framework names. If you can do that, you understand the product before the technology."
    },
    {
      id: "web-foundations",
      title: "Web Dev Foundations",
      goal: "Build the vocabulary needed to read TypeScript, React, CSS, and browser/server boundaries.",
      lessons: [
        {
          title: "HTML, CSS, and JavaScript Refresher",
          summary: "HTML describes structure, CSS describes presentation, and JavaScript/TypeScript describes behavior.",
          concepts: [
            "HTML elements are the raw building blocks: buttons, forms, links, sections, inputs, headings.",
            "CSS classes style those elements. Tailwind uses many small utility classes instead of one large custom class.",
            "JavaScript runs in the browser for interactivity. TypeScript adds compile-time types.",
            "Forms are important in this project because many server actions receive `FormData`."
          ],
          unity: "HTML is the hierarchy, CSS is the visual styling/anchors/layout components, and JavaScript is the behavior script.",
          walkthrough: [
            "In `app/page.tsx`, look for JSX tags like `<PageHeader>`, `<Panel>`, `<Link>`, and `<VodCard>`.",
            "Inspect class names like `grid`, `gap-5`, `bg-gold-300`, and `text-sm`. Those are Tailwind utilities.",
            "Find a `<form>` in a component and see how it connects to a server action."
          ],
          files: [`${WEB_ROOT}\\app\\page.tsx`, `${WEB_ROOT}\\components\\vod-submit-form.tsx`, `${WEB_ROOT}\\app\\globals.css`],
          exercise: "Choose one card in the dashboard code and list which part is structure, which part is styling, and which part is behavior.",
          review: ["What does HTML own?", "What does CSS own?", "Why are forms common in this app?"]
        },
        {
          title: "TypeScript Compared to C#",
          summary: "TypeScript is JavaScript with type checking. It is less strict than C# at runtime, but it catches many mistakes while editing and building.",
          concepts: [
            "`string`, `number`, `boolean`, arrays, object types, unions, and literal types are common.",
            "TypeScript types disappear at runtime. The browser runs JavaScript, not TypeScript.",
            "`bigint` is used for Discord snowflake IDs because Discord IDs can exceed safe JavaScript number precision.",
            "`type` aliases describe shapes of props and data rows, similar to lightweight C# DTOs."
          ],
          unity: "A TypeScript prop type is like a C# class or struct used to document what a MonoBehaviour expects, except it does not exist after compilation.",
          walkthrough: [
            "Open `vod-detail-workspace.tsx` and read the `VodWorkspaceProps` type.",
            "Look for union state like `useState<'feedback' | 'deaths' | 'drawings'>`.",
            "Find `BigInt(...)` usage in actions/auth code and connect it to Discord IDs."
          ],
          files: [`${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\lib\\discord-auth.ts`],
          exercise: "Write a TypeScript type for a simplified VOD with `id`, `playerName`, `vodUrl`, `status`, and `deaths`.",
          review: ["Why are Discord IDs stored as BigInt?", "Do TypeScript types exist at runtime?", "What is a union type good for?"]
        },
        {
          title: "React Components as Prefabs Plus Scripts",
          summary: "React components are functions that receive props and return UI. They compose together to build pages.",
          concepts: [
            "A component name starts with a capital letter: `VodCard`, `Panel`, `YouTubePlayer`.",
            "Props are passed as attributes: `<VodCard vod={vod} />`.",
            "Components can be server-side or client-side depending on whether they need browser behavior.",
            "Repeated UI is usually rendered by mapping arrays to components."
          ],
          unity: "A React component is close to a prefab variant generated from data. Instead of dragging 50 cards into a scene, the page maps 50 database rows into 50 `VodCard` components.",
          walkthrough: [
            "Find `sortedVods.map((vod) => <VodCard ... />)` in the dashboard.",
            "Open `VodCard` and see how it renders one VOD's compact summary.",
            "Open `ui.tsx` and find reusable building blocks such as `Panel`, `Button`, and `Metric`."
          ],
          files: [`${WEB_ROOT}\\app\\page.tsx`, `${WEB_ROOT}\\components\\vod-card.tsx`, `${WEB_ROOT}\\components\\ui.tsx`],
          exercise: "Sketch a component tree for the dashboard: Dashboard -> PageHeader -> DashboardFilters -> VodCard list -> DashboardStats.",
          review: ["How do props enter a component?", "Why is mapping arrays useful?", "What does component composition mean?"]
        },
        {
          title: "Server and Client Separation",
          summary: "Next.js App Router lets some components run only on the server and others run in the browser. Knowing the boundary prevents confusion.",
          concepts: [
            "Server code can safely access environment variables, Prisma, cookies, and file system APIs.",
            "Client code can use `useState`, `useEffect`, browser APIs, player APIs, and localStorage.",
            "A file with `'use client'` is included in the browser bundle.",
            "Client components can call server actions, but they cannot directly import server-only modules like Prisma."
          ],
          unity: "Imagine server components as authoritative simulation code and client components as player camera/UI input code.",
          walkthrough: [
            "`app/page.tsx` fetches VODs from Prisma, then passes data into client components.",
            "`vod-detail-workspace.tsx` owns modals, highlighted markers, seeking, and tab state.",
            "`app/actions.ts` mutates the database after user actions."
          ],
          files: [`${WEB_ROOT}\\app\\page.tsx`, `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\app\\actions.ts`],
          exercise: "For each item, decide server or client: fetch VOD rows, open modal, read cookies, seek YouTube player, insert feedback.",
          review: ["What does `'use client'` mean?", "Why should Prisma stay on the server?", "Why does the video player need browser code?"]
        }
      ],
      quiz: [
        { q: "Which language adds types on top of JavaScript?", options: ["TypeScript", "SQLite", "OAuth"], answer: 0 },
        { q: "What marks a component as browser-side in Next.js?", options: ["'use client'", "'use browser'", "'react client'"], answer: 0 },
        { q: "React props are most like...", options: ["data passed into a prefab/script", "a database migration", "a Discord permission bit"], answer: 0 }
      ],
      test: "Open one component and explain its props, visible output, and any state it owns."
    },
    {
      id: "nextjs-structure",
      title: "Next.js App Structure",
      goal: "Understand App Router routes, layouts, pages, server actions, and API routes in Voddy.",
      lessons: [
        {
          title: "Routes and Pages",
          summary: "In App Router, folders inside `app` become URL routes. `page.tsx` files render those routes.",
          concepts: [
            "`app/page.tsx` is `/` and renders the dashboard or landing screen.",
            "`app/vods/[id]/page.tsx` is a dynamic route for one VOD.",
            "`app/sessions/page.tsx` lists sessions, while `app/sessions/[date]/page.tsx` renders one session.",
            "`app/settings/death-dataset/page.tsx` is a nested settings tool route."
          ],
          unity: "Routes are like scenes, but file paths define them. Dynamic routes are like one scene loaded with a different ID parameter.",
          walkthrough: [
            "Run through the `app` folder names and say the URL out loud.",
            "Find the dynamic `[id]` folder. That bracket means the route captures a value from the URL.",
            "Notice pages can be async because they fetch data before rendering."
          ],
          files: [`${WEB_ROOT}\\app\\page.tsx`, `${WEB_ROOT}\\app\\vods\\[id]\\page.tsx`, `${WEB_ROOT}\\app\\sessions\\page.tsx`],
          exercise: "Map five files in the `app` folder to their URLs.",
          review: ["What file renders `/`?", "What does `[id]` mean?", "Why can page components be async?"]
        },
        {
          title: "Layouts and Shared UI",
          summary: "`layout.tsx` wraps pages with shared structure such as global styles, navigation, auth panels, guild switcher, and theme controls.",
          concepts: [
            "Layouts persist around route changes.",
            "Global CSS is imported once from the layout.",
            "Shared UI components reduce duplicate page chrome.",
            "This project's UI patterns live in `components/ui.tsx` and app-level layout files."
          ],
          unity: "A layout is like a persistent UI canvas or boot scene that remains while sub-scenes change underneath.",
          walkthrough: [
            "Open `app/layout.tsx` and identify global wrappers.",
            "Open `components/ui.tsx` and find project-wide Panel/Button/Metric styles.",
            "Notice how pages import components instead of redefining the same UI."
          ],
          files: [`${WEB_ROOT}\\app\\layout.tsx`, `${WEB_ROOT}\\components\\ui.tsx`, `${WEB_ROOT}\\app\\globals.css`],
          exercise: "Find three UI components reused across multiple pages and write where they appear.",
          review: ["What does a layout wrap?", "Why use shared components?", "Where is global CSS loaded?"]
        },
        {
          title: "Server Actions",
          summary: "Server actions are functions that run on the server in response to form submissions or client calls. Voddy uses them for almost every database mutation.",
          concepts: [
            "`'use server'` at the top of `app/actions.ts` marks exported functions as server actions.",
            "Actions validate inputs, check permissions, mutate Prisma data, then revalidate affected routes.",
            "Examples include `createVod`, `addFeedback`, `addDeath`, `assignReviewer`, `queueDeathDetection`, and `archiveVod`.",
            "Forms can bind arguments with `action={addFeedback.bind(null, vodId)}`."
          ],
          unity: "A server action is like a command handler: validate who called it, parse payload, mutate authoritative state, then tell views to refresh.",
          walkthrough: [
            "Read the top helper functions in `actions.ts`: `now`, `required`, `bigintValue`, `intValue`.",
            "Compare `createVod` and `addFeedback`. Both parse form data and create Prisma rows.",
            "Find `revalidatePath` calls after mutations."
          ],
          files: [`${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\components\\vod-submit-form.tsx`],
          exercise: "Write pseudocode for `addFeedback`: require reviewer, parse timestamp, create feedback row, revalidate VOD page.",
          review: ["Why should actions validate input?", "What does `bind(null, vodId)` accomplish?", "Why revalidate after writing data?"]
        },
        {
          title: "API Routes",
          summary: "API routes are server endpoints under `app/api`. Voddy uses them for Discord OAuth and serving generated death-dataset frames.",
          concepts: [
            "`app/api/auth/discord/start/route.ts` starts OAuth by redirecting to Discord.",
            "`app/api/auth/discord/callback/route.ts` receives Discord's code, exchanges it for tokens, syncs user data, and sets a session cookie.",
            "`app/api/auth/logout/route.ts` clears the session.",
            "Dataset routes serve local images to the web UI without exposing arbitrary files."
          ],
          unity: "API routes are like small network message handlers. They do not render a page; they process a request and return a response or redirect.",
          walkthrough: [
            "Open the auth route files and identify redirects, cookies, and token exchange.",
            "Open the death dataset API route and notice path validation.",
            "Compare an API route to a server action: both run on the server, but actions are usually called by forms/components."
          ],
          files: [
            `${WEB_ROOT}\\app\\api\\auth\\discord\\start\\route.ts`,
            `${WEB_ROOT}\\app\\api\\auth\\discord\\callback\\route.ts`,
            `${WEB_ROOT}\\app\\api\\death-dataset-frame\\route.ts`
          ],
          exercise: "Write a one-paragraph difference between page route, server action, and API route.",
          review: ["What starts Discord OAuth?", "What receives the OAuth callback?", "Why validate file paths in dataset routes?"]
        }
      ],
      quiz: [
        { q: "`app/vods/[id]/page.tsx` renders what kind of route?", options: ["Dynamic route", "CSS route", "Database route"], answer: 0 },
        { q: "Where do most database mutations live?", options: ["app/actions.ts", "tailwind.config.ts", "next-env.d.ts"], answer: 0 },
        { q: "What does `revalidatePath` do?", options: ["Refreshes cached route data", "Deletes database rows", "Installs Prisma"], answer: 0 }
      ],
      test: "Add a route map to your notes covering dashboard, VOD detail, sessions, stats, settings, OAuth start, and OAuth callback."
    },
    {
      id: "database-prisma",
      title: "Database and Prisma",
      goal: "Learn SQLite tables, Prisma models, relations, and the actual Voddy data model.",
      lessons: [
        {
          title: "SQLite Basics",
          summary: "SQLite is a file-based relational database. Voddy stores local data in `data/vod_review_bot.db`.",
          concepts: [
            "A table is like a spreadsheet with typed columns.",
            "A row is one saved object: one VOD, one feedback note, one guild membership.",
            "Primary keys uniquely identify rows. Foreign keys connect rows.",
            "Indexes speed up common filters, such as VODs by guild, player, event date, and timestamp."
          ],
          unity: "SQLite is more structured than a JSON save file. It is closer to many related save files with rules about how records connect.",
          walkthrough: [
            "In Python storage, find `CREATE TABLE IF NOT EXISTS vods`.",
            "Find indexes like `idx_vods_guild` and `idx_feedback_vod_time`.",
            "Notice `ON DELETE CASCADE` on related tables, which removes child rows when a VOD is deleted."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`, `${PROJECT_ROOT}\\data\\vod_review_bot.db`],
          exercise: "List the tables that should disappear automatically when a VOD is deleted.",
          review: ["What is a row?", "What is a foreign key?", "What does cascade delete mean?"]
        },
        {
          title: "Prisma Schema",
          summary: "Prisma turns database tables into typed TypeScript models and a query API.",
          concepts: [
            "`model Vod` maps to the `vods` table using `@@map('vods')`.",
            "`@map` maps a TypeScript-friendly field name like `playerVodId` to a database column like `player_vod_id`.",
            "Relations such as `feedback Feedback[]` let Prisma include child rows.",
            "Indexes and unique constraints are documented in the schema."
          ],
          unity: "A Prisma model resembles a C# class for saved data, plus metadata describing how it maps to disk.",
          walkthrough: [
            "Read `model Vod` and identify scalar fields, relation fields, indexes, and table mapping.",
            "Read `model Feedback` and find its `vod` relation.",
            "Read `model GuildMembership` and find its unique pair of guild and user."
          ],
          files: [`${WEB_ROOT}\\prisma\\schema.prisma`],
          exercise: "Pick five `Vod` fields and write the database column name for each.",
          review: ["What does `@@map` do?", "What does `@map` do?", "How does Prisma represent one-to-many relations?"]
        },
        {
          title: "CRUD Queries",
          summary: "CRUD means create, read, update, delete. Voddy performs all four through both Prisma and Python SQL.",
          concepts: [
            "Create: `prisma.vod.create`, `prisma.feedback.create`, Python `INSERT INTO`.",
            "Read: `findMany`, `findUnique`, Python `SELECT`.",
            "Update: `prisma.vod.update`, Python `UPDATE`.",
            "Delete: `delete`, `deleteMany`, Python `DELETE`."
          ],
          unity: "CRUD is the database equivalent of Instantiate, query scene/save data, mutate component fields, and destroy objects.",
          walkthrough: [
            "Find `createVod`, `updateVodStatus`, `deleteVod`, and dashboard `findMany`.",
            "In Python, find `create_vod`, `list_vods`, `update_status`, and `delete_vod`.",
            "Notice how web and bot versions accomplish similar work with different libraries."
          ],
          files: [`${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\app\\page.tsx`, `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`],
          exercise: "For one feature, write the create/read/update/delete operations it needs. Example: feedback needs create, read with VOD, edit, delete.",
          review: ["What Prisma method creates rows?", "What SQL keyword reads rows?", "Why is delete risky?"]
        },
        {
          title: "How Voddy Stores Review Data",
          summary: "The schema separates guild access, VOD metadata, reviewer comments, objective markers, visual drawings, pinned items, masterclass content, and background jobs.",
          concepts: [
            "`Vod` is the parent for feedback, deaths, drawings, and death detection jobs.",
            "`AuthUser` and `GuildMembership` store login identity and guild access synced from Discord.",
            "`GuildSetting` stores the reviewer role configured by the bot.",
            "`MasterclassVod` mirrors review concepts for curated educational VODs.",
            "`DeathDetectionJob` stores queue status and progress for scans."
          ],
          unity: "This is like splitting a large save into multiple ScriptableObject types instead of one giant blob. Each type has a job.",
          walkthrough: [
            "Group the schema models by responsibility: review workflow, auth/permissions, settings/admin, masterclass, background jobs.",
            "Find all relations connected to `Vod`.",
            "Find all models that store a Discord snowflake as BigInt."
          ],
          files: [`${WEB_ROOT}\\prisma\\schema.prisma`],
          exercise: "Create a mini ERD diagram showing Vod -> Feedback, DeathTimestamp, DrawingMarker, DeathDetectionJob.",
          review: ["Which table stores replies to feedback?", "Which table stores guild role settings?", "Which table stores scan progress?"]
        }
      ],
      quiz: [
        { q: "Which Prisma model maps to the `vods` table?", options: ["Vod", "VideoAsset", "ReviewPage"], answer: 0 },
        { q: "What does `ON DELETE CASCADE` do?", options: ["Deletes child rows when parent is deleted", "Caches pages", "Starts OAuth"], answer: 0 },
        { q: "Why are `Feedback` and `DeathTimestamp` separate?", options: ["Subjective coaching vs objective markers", "One is React and one is Python", "SQLite requires it"], answer: 0 }
      ],
      test: "Explain the data model to a future teammate using only the schema file."
    },
    {
      id: "discord-bot",
      title: "Discord Bot",
      goal: "Understand bot startup, slash commands, permissions, guilds, and how Discord submissions become website data.",
      lessons: [
        {
          title: "Bot Startup",
          summary: "The Python entry point loads config, creates a discord.py bot, connects storage, syncs commands, tracks guilds, and starts the death detection service.",
          concepts: [
            "`python -m src.vod_review_bot` runs `__main__.py`, which calls the bot main function.",
            "`VODReviewBot.setup_hook` connects storage and registers slash commands.",
            "`on_ready` syncs guilds, reviewer role names, installed guild commands, and starts the background death detection task.",
            "The bot's shared database path comes from config/environment."
          ],
          unity: "This is like a bootstrap scene: load config, initialize services, register input handlers, then start background systems.",
          walkthrough: [
            "Open `__main__.py`, `config.py`, and `bot.py`.",
            "Follow `main()` to `VODReviewBot(config)` to `bot.start(config.token)`.",
            "Read `on_ready` and list every startup side effect."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\__main__.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\config.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`],
          exercise: "Write a startup checklist in your own words.",
          review: ["What loads the token?", "When are commands registered?", "When does death detection start?"]
        },
        {
          title: "Slash Commands",
          summary: "Slash commands are Discord-native commands grouped under `/vod`. Each command is an async Python function decorated with `@vod_group.command`.",
          concepts: [
            "`/vod submit` creates VODs.",
            "`/vod list`, `/vod post`, `/vod summary`, and `/vod session` read VODs.",
            "`/vod feedback` and `/vod death_add` add review markers.",
            "`/vod reviewed`, `/vod assign`, and `/vod set_reviewer_role` manage workflow state and permissions."
          ],
          unity: "Decorated command functions are like registered console commands or editor menu items. Discord invokes them with typed parameters.",
          walkthrough: [
            "Search for `@vod_group.command` in `bot.py`.",
            "Read `submit_vod` and find validation, target player resolution, database creation, and response posting.",
            "Read `add_feedback` and compare timestamp parsing to web actions."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\timeutils.py`],
          exercise: "Pick three slash commands and write: inputs, permission check, database operation, response.",
          review: ["What is the slash command group name?", "Why are command functions async?", "What does autocomplete help with?"]
        },
        {
          title: "Discord Permissions and Guilds",
          summary: "Voddy supports multiple servers. VODs, reviewer roles, guild settings, stats, and website access are scoped by Discord guild ID.",
          concepts: [
            "A guild is a Discord server.",
            "The bot records installed guilds in the `guilds` table.",
            "Reviewer role is configured per guild through `/vod set_reviewer_role` and stored in `guild_settings`.",
            "Commands check reviewer role, Discord Administrator permission, submitter identity, and VOD visibility depending on action."
          ],
          unity: "Guild ID is like a world/server ID. Without it, data from different servers would blend together.",
          walkthrough: [
            "Find `guild_id_for`, `is_reviewer`, `member_has_reviewer_role`, and `can_view_vod`.",
            "Find storage methods `upsert_guild`, `sync_guilds`, `mark_guild_removed`, and reviewer role settings.",
            "Compare guild scoping in bot storage to web `selectedGuild` and auth membership."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`, `${WEB_ROOT}\\lib\\guild-context.ts`],
          exercise: "Write a short rule list for who can view, review, assign, and delete a VOD.",
          review: ["What is a guild?", "Where is reviewer role stored?", "Why scope VODs by guild?"]
        },
        {
          title: "Bot Submissions to Website Data",
          summary: "When `/vod submit` creates a row, the website can immediately show it because both programs use the same database shape.",
          concepts: [
            "The bot assigns a player-specific `player_vod_id` for Discord-friendly references.",
            "The web dashboard queries `Vod` rows by guild and filters.",
            "The VOD page reads relations like feedback, death timestamps, drawings, and jobs.",
            "The bot posts embeds and buttons, but the website renders richer review tools."
          ],
          unity: "The bot writes to the save file; the web app reloads the save file and builds a richer editor view around it.",
          walkthrough: [
            "In bot `submit_vod`, find the `Storage.create_vod` call.",
            "In web dashboard, find `prisma.vod.findMany`.",
            "Check that both use fields like className/class_name, spec, role, warType/war_type, eventDate/event_date."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`, `${WEB_ROOT}\\app\\page.tsx`],
          exercise: "Submit flow paper trace: Discord interaction -> validation -> SQLite insert -> dashboard query -> VOD card.",
          review: ["Why does the website not need Discord to tell it about a bot submission?", "What is a player-specific VOD ID?", "What does the bot post after public submission?"]
        }
      ],
      quiz: [
        { q: "Which Python library powers the Discord bot?", options: ["discord.py", "Prisma", "React"], answer: 0 },
        { q: "What does a Discord guild mean?", options: ["A server", "A database table only", "A React component"], answer: 0 },
        { q: "How does a bot-created VOD appear on the website?", options: ["It is saved in the shared database", "Discord sends a webhook to the page", "The browser reads bot memory"], answer: 0 }
      ],
      test: "Trace `/vod submit` from command handler to VOD card."
    },
    {
      id: "auth-permissions",
      title: "Auth and Permissions",
      goal: "Understand Discord OAuth, signed cookies, membership sync, site admins, reviewers, normal users, and private VODs.",
      lessons: [
        {
          title: "Discord OAuth",
          summary: "OAuth lets the website ask Discord who the user is and which guilds they belong to, without asking for a Discord password.",
          concepts: [
            "The app redirects to Discord with a state token.",
            "Discord redirects back with a temporary code.",
            "The app exchanges the code for access/refresh tokens.",
            "The app calls Discord APIs to fetch user, guilds, and guild member roles."
          ],
          unity: "OAuth is like delegating login to Steam/Epic/Discord. Your app receives verified identity data instead of handling passwords.",
          walkthrough: [
            "Open OAuth start route and find state creation and redirect URL.",
            "Open callback route and find state validation, code exchange, user sync, and cookie set.",
            "Open `discord-auth.ts` and read `exchangeDiscordCode` and `syncDiscordUser`."
          ],
          files: [
            `${WEB_ROOT}\\app\\api\\auth\\discord\\start\\route.ts`,
            `${WEB_ROOT}\\app\\api\\auth\\discord\\callback\\route.ts`,
            `${WEB_ROOT}\\lib\\discord-auth.ts`
          ],
          exercise: "Write OAuth as a six-step sequence diagram.",
          review: ["Why does OAuth use a callback?", "What is the state token for?", "Why store guild memberships?"]
        },
        {
          title: "Sessions and Cookies",
          summary: "After OAuth, Voddy sets a signed HTTP-only cookie that identifies the Discord user on later page requests.",
          concepts: [
            "`voddy_session` stores the Discord ID plus an HMAC signature.",
            "The signature prevents users from changing the cookie to impersonate another Discord ID.",
            "HTTP-only cookies are not readable from normal browser JavaScript.",
            "Local development can bypass OAuth and use a dev user if OAuth env vars are missing."
          ],
          unity: "A signed session cookie is like a tamper-resistant save token. The server checks that it created the token before trusting it.",
          walkthrough: [
            "Read `sign`, `encodeSession`, and `decodeSession`.",
            "Read `getAuthSession` and notice configured vs local-dev behavior.",
            "Find logout route and see it clears the cookie."
          ],
          files: [`${WEB_ROOT}\\lib\\discord-auth.ts`, `${WEB_ROOT}\\app\\api\\auth\\logout\\route.ts`, `${WEB_ROOT}\\lib\\domain.ts`],
          exercise: "Explain why storing only a plain Discord ID cookie would be unsafe.",
          review: ["What makes the cookie signed?", "What does HTTP-only protect?", "What happens when OAuth is not configured locally?"]
        },
        {
          title: "Roles: Admins, Reviewers, and Normal Users",
          summary: "Voddy combines Discord ownership/admin permissions, configured reviewer roles, and database-managed site admins.",
          concepts: [
            "Guild owners and Discord Administrators can review in their guild.",
            "Configured reviewer roles can review and manage VOD workflow.",
            "Site admins can access global/admin-only website tools such as masterclass management and dataset labeling.",
            "Normal guild members can access guild VODs and submit where permitted."
          ],
          unity: "This is like layered access control: game server admin, team officer role, and ordinary player.",
          walkthrough: [
            "Read `canReview`, `requireGuildMember`, and `requireReviewer`.",
            "Open `site-admin.ts` and find site admin checks.",
            "Find where actions call `requireReviewer` or `requireSiteAdmin`."
          ],
          files: [`${WEB_ROOT}\\lib\\discord-auth.ts`, `${WEB_ROOT}\\lib\\site-admin.ts`, `${WEB_ROOT}\\app\\actions.ts`],
          exercise: "Make a permission matrix with actions as rows and roles as columns.",
          review: ["Who can review if no local OAuth is configured?", "What role can queue death scans?", "What is a site admin for?"]
        },
        {
          title: "Public and Private VODs",
          summary: "VOD visibility controls whether a submitted video is broadly visible or limited to the player/submitter/reviewers.",
          concepts: [
            "`visibility` is stored on the `Vod` row.",
            "Bot `can_view_vod` allows public VODs to everyone, private VODs to player, submitter, or reviewer.",
            "Web pages should respect guild membership and reviewer/admin checks.",
            "Private VODs matter because review content may be sensitive or player-specific."
          ],
          unity: "Visibility is a gameplay rule on an entity. UI should not show or mutate entities that the actor cannot access.",
          walkthrough: [
            "Find `visibility` in Prisma and Python storage.",
            "Find private handling in `/vod submit`.",
            "Find web action `updateVodVisibility`."
          ],
          files: [`${WEB_ROOT}\\prisma\\schema.prisma`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`, `${WEB_ROOT}\\app\\actions.ts`],
          exercise: "Write three test cases for private VOD visibility.",
          review: ["Where is visibility stored?", "Who can view private VODs in the bot?", "Why should permissions be checked server-side?"]
        }
      ],
      quiz: [
        { q: "OAuth prevents Voddy from needing to store what?", options: ["Discord passwords", "VOD URLs", "SQLite rows"], answer: 0 },
        { q: "Why sign the session cookie?", options: ["To prevent tampering", "To style it", "To make it bigger"], answer: 0 },
        { q: "Which function is used before reviewer-only mutations?", options: ["requireReviewer", "parseTimestamp", "displayLabel"], answer: 0 }
      ],
      test: "Explain how a logged-in website user becomes authorized to review a VOD."
    },
    {
      id: "review-workflow",
      title: "VOD Review Workflow",
      goal: "Understand the user journey from submission to markers, replies, assignments, status, sessions, and multi-POV review.",
      lessons: [
        {
          title: "Submitting VODs",
          summary: "A VOD submission captures the who, where, when, what class/role, video URL, visibility, notes, and initial review state.",
          concepts: [
            "Required fields keep review data useful: event date, class, spec, role, war type, URL.",
            "Player can default to submitter or be selected for officer/reviewer submissions.",
            "War session currently mirrors event date.",
            "New VODs start as `Needs Review` and `Not Requested` for death detection."
          ],
          unity: "Submission is spawning a review entity with validated serialized fields.",
          walkthrough: [
            "Compare web `createVod` with bot `submit_vod`.",
            "Find default values for status, visibility, player VOD ID, and death detection status.",
            "Look at `VodSubmitForm` for form fields."
          ],
          files: [`${WEB_ROOT}\\components\\vod-submit-form.tsx`, `${WEB_ROOT}\\app\\actions.ts`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`],
          exercise: "Write a submission validation checklist.",
          review: ["Why is event date required?", "What status does a VOD start with?", "Why have player-specific IDs?"]
        },
        {
          title: "Review Controls",
          summary: "The VOD detail workspace is the review cockpit: video, markers, status, assignment, scan jobs, notes, and marker navigation.",
          concepts: [
            "`VodDetailWorkspace` is a client component because it owns modals, tabs, highlights, seeking, and player state.",
            "Server actions still own the database writes.",
            "Review statuses include Needs Review, In Review, and Reviewed.",
            "Assignment sets reviewer identity and moves status to In Review."
          ],
          unity: "This is an editor tool window attached to one selected VOD object.",
          walkthrough: [
            "Open `VodDetailWorkspace` and scan the props.",
            "Find the review controls panel.",
            "Find status forms and reviewer assignment form."
          ],
          files: [`${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\lib\\domain.ts`],
          exercise: "List every button in the review controls panel and the action/state it changes.",
          review: ["Why is this component client-side?", "What does assignment do to status?", "Where are statuses normalized?"]
        },
        {
          title: "Feedback, Deaths, Drawings, and Replies",
          summary: "Voddy supports several annotation types so reviewers can coach precisely without mixing different kinds of information.",
          concepts: [
            "Feedback has timestamp, category, optional death cause, note, reviewer, and replies.",
            "Death timestamps have timestamp, source, cause tag, note, and creator.",
            "Drawing markers store captured image data and drawing data at a timestamp.",
            "Replies allow discussion around a specific feedback note."
          ],
          unity: "Think of each marker as a component attached to a VOD timeline entity. Different marker types have different fields and behavior.",
          walkthrough: [
            "Find `AddFeedbackForm`, `AddDeathForm`, `FeedbackArticle`, `DeathArticle`, and `DrawingMarkerList`.",
            "Trace each save to a server action.",
            "Look at the Prisma relations for feedback replies and drawing markers."
          ],
          files: [`${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\components\\drawing-tool.tsx`, `${WEB_ROOT}\\prisma\\schema.prisma`],
          exercise: "Create sample rows for one feedback, one death timestamp, and one drawing marker.",
          review: ["Which marker has replies?", "Which marker can have source `auto`?", "What does a drawing marker need to replay later?"]
        },
        {
          title: "Sessions and Multi-POV Review",
          summary: "War sessions group VODs by event date so reviewers can study multiple perspectives from the same fight.",
          concepts: [
            "Session pages query VODs by `eventDate`/`warSession`.",
            "Session board UI can compare multiple VODs and focus selected POVs.",
            "Syncing multiple external video providers is hard, so the UI provides practical controls rather than perfect authority.",
            "The product goal is fast review of 2-4 selected POVs."
          ],
          unity: "A session is like loading several camera recordings from the same match timeline.",
          walkthrough: [
            "Open sessions list and session detail pages.",
            "Open `session-board.tsx` and identify client-side controls.",
            "Connect session grouping back to VOD `eventDate`."
          ],
          files: [`${WEB_ROOT}\\app\\sessions\\page.tsx`, `${WEB_ROOT}\\app\\sessions\\[date]\\page.tsx`, `${WEB_ROOT}\\components\\session-board.tsx`],
          exercise: "Explain how you would align two POVs manually if one starts 15 seconds later.",
          review: ["What field groups sessions?", "Why are sessions useful for BDO wars?", "Why is perfect sync difficult?"]
        }
      ],
      quiz: [
        { q: "Which component is the main VOD review cockpit?", options: ["VodDetailWorkspace", "GuildSwitcher", "AuthPanel"], answer: 0 },
        { q: "What does a new VOD's review status start as?", options: ["Needs Review", "Reviewed", "Archived"], answer: 0 },
        { q: "What groups war sessions?", options: ["eventDate / warSession", "avatar", "OAuth state"], answer: 0 }
      ],
      test: "Perform a dry-run review on paper: submit VOD, assign reviewer, add feedback, add death, reply, mark reviewed."
    },
    {
      id: "video-players",
      title: "Video Players",
      goal: "Understand YouTube/Twitch embeds, custom controls, seeking, pausing, timestamps, markers, and provider limitations.",
      lessons: [
        {
          title: "YouTube and Twitch Embeds",
          summary: "Voddy supports external video providers by embedding their players and wrapping them with review controls.",
          concepts: [
            "YouTube has an iframe API that can seek, play, pause, and report time.",
            "Twitch embed behavior differs and has its own constraints.",
            "The app parses URLs to decide provider and embed behavior.",
            "External providers limit how much native UI can be hidden or controlled."
          ],
          unity: "Embedding YouTube/Twitch is like integrating a third-party SDK that owns part of the UI and event loop.",
          walkthrough: [
            "Open `youtube-api.ts` and `twitch-api.ts`.",
            "Open `video-embed.tsx` and `youtube-player.tsx`.",
            "Find URL parsing and provider detection."
          ],
          files: [`${WEB_ROOT}\\lib\\youtube-api.ts`, `${WEB_ROOT}\\lib\\twitch-api.ts`, `${WEB_ROOT}\\components\\video-embed.tsx`, `${WEB_ROOT}\\components\\youtube-player.tsx`],
          exercise: "Paste three sample URLs in your notes and identify which provider/parser should handle them.",
          review: ["Why use provider APIs?", "Why can provider UI be hard to control?", "Where does YouTube-specific code live?"]
        },
        {
          title: "Custom Controls and Markers",
          summary: "Voddy overlays custom review controls and timeline markers on top of provider playback.",
          concepts: [
            "Markers are built from feedback and death timestamp rows.",
            "Clicking a marker jumps the player and scrolls/highlights the related annotation.",
            "Buttons can mark feedback/death using the current player timestamp.",
            "Keyboard shortcuts provide fast reviewer flow."
          ],
          unity: "This is a timeline editor: markers are clips/events, and clicking them moves the playhead.",
          walkthrough: [
            "In `VodDetailWorkspace`, find the `markers` array passed to `YouTubePlayer`.",
            "Find `onMarkerClick`, `onMarkFeedback`, and `onMarkDeath`.",
            "Open `keybinds.ts` and settings controls for shortcuts."
          ],
          files: [`${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\components\\youtube-player.tsx`, `${WEB_ROOT}\\lib\\keybinds.ts`, `${WEB_ROOT}\\components\\settings-panel.tsx`],
          exercise: "Design one new keyboard shortcut and specify what state/action it would touch.",
          review: ["How are markers constructed?", "What happens when a marker is clicked?", "Why do reviewers need shortcuts?"]
        },
        {
          title: "Seeking, Pausing, and Timestamps",
          summary: "Timestamps connect database annotations to exact video moments. The UI converts between human strings and numeric seconds.",
          concepts: [
            "Database stores `timestampSeconds` as an integer.",
            "Humans type and read timestamps like `12:34` or `1:02:03`.",
            "`parseTimestamp` converts strings into seconds.",
            "`formatTimestamp` converts seconds back into readable strings."
          ],
          unity: "This is the same as storing time as float/int seconds in gameplay code, then formatting it for UI.",
          walkthrough: [
            "Open `lib/format.ts` and Python `timeutils.py`.",
            "Compare parsing/formatting behavior between web and bot.",
            "Find where formatted timestamps appear in feedback/death articles."
          ],
          files: [`${WEB_ROOT}\\lib\\format.ts`, `${PROJECT_ROOT}\\src\\vod_review_bot\\timeutils.py`, `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`],
          exercise: "Convert these to seconds: `45`, `3:15`, `1:02:08`. Then format 3728 seconds.",
          review: ["Why store seconds instead of raw strings?", "Where is timestamp parsing used?", "What does pause-on-seek help with?"]
        },
        {
          title: "Why Video APIs Are Annoying",
          summary: "Video providers optimize for their platform, ads, privacy, and playback rules. Review tools must work around inconsistent APIs and browser policies.",
          concepts: [
            "Autoplay and audio behavior are restricted by browsers.",
            "Quality selection can be best-effort or unavailable.",
            "Provider UI cannot always be fully hidden.",
            "Different providers expose different event models and capabilities."
          ],
          unity: "It is like building one input system over several third-party controllers with different button layouts and locked firmware.",
          walkthrough: [
            "Read project notes about video embed limitations in `CODEX_CONTEXT.md`.",
            "Find player code that uses best-effort controls instead of assuming perfect control.",
            "Identify any fallback UI for unsupported providers."
          ],
          files: [`${PROJECT_ROOT}\\CODEX_CONTEXT.md`, `${WEB_ROOT}\\components\\youtube-player.tsx`, `${WEB_ROOT}\\components\\video-embed.tsx`],
          exercise: "Write three provider limitations that would affect a polished VOD review tool.",
          review: ["Why is quality selection unreliable?", "Why can autoplay fail?", "Why keep custom controls practical instead of perfect?"]
        }
      ],
      quiz: [
        { q: "What unit does the database use for annotation timestamps?", options: ["Seconds", "Formatted strings only", "Frames"], answer: 0 },
        { q: "What does a marker click usually do?", options: ["Seek and highlight related annotation", "Delete the VOD", "Log out"], answer: 0 },
        { q: "Why are video provider APIs tricky?", options: ["Different limits and browser policies", "They are stored in SQLite", "They use Prisma"], answer: 0 }
      ],
      test: "Trace the Add Feedback at current time flow from player time to saved row to rendered marker."
    },
    {
      id: "death-detection",
      title: "Death Detection",
      goal: "Understand the current template/ML workflow, dataset labeling, model training ideas, metrics, and failure modes.",
      lessons: [
        {
          title: "Template-Based Scanning",
          summary: "The early death scanner can sample video frames and look for visual patterns that resemble the BDO death screen.",
          concepts: [
            "A background job owns long-running scan work so Discord/web requests stay responsive.",
            "Detected candidates become death timestamps with source `auto`.",
            "Auto markers should coexist with manual reviewer markers.",
            "A tolerance window prevents duplicate markers near existing deaths."
          ],
          unity: "This is like a background analyzer that scans recorded frames and emits gameplay events for review.",
          walkthrough: [
            "Open `death_detection.py` and `death_model.py`.",
            "Find where storage updates job status/progress.",
            "Find `add_auto_death_candidate` in storage."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\death_detection.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\death_model.py`, `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`],
          exercise: "Write pseudocode for a scanner loop: get job, mark scanning, sample frames, add candidates, mark complete/failed.",
          review: ["Why should scanning be background work?", "What source marks automatic deaths?", "Why avoid duplicate nearby markers?"]
        },
        {
          title: "Dataset Labeling",
          summary: "The project includes tooling to save frames as `death` or `not_death` so an ML model can learn from examples.",
          concepts: [
            "Frames are extracted from VOD URLs at specific timestamps.",
            "Labeling tools write images into dataset folders.",
            "The web app includes dataset pages and development controls for labeling current frames.",
            "Good datasets include confusing near-misses, not just obvious examples."
          ],
          unity: "Dataset labeling is like building a training set of screenshots tagged with the gameplay state you want the model to recognize.",
          walkthrough: [
            "Open `dataset_labeler.py`.",
            "Find actions `saveDeathDatasetFrame`, `generateDeathDatasetBatch`, and `labelDeathDatasetCandidate`.",
            "Open death dataset settings page and labeler component."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\dataset_labeler.py`, `${WEB_ROOT}\\app\\settings\\death-dataset\\page.tsx`, `${WEB_ROOT}\\components\\death-dataset-labeler.tsx`, `${WEB_ROOT}\\app\\actions.ts`],
          exercise: "Define a labeling protocol: what counts as death, not death, uncertain, duplicate, or bad frame?",
          review: ["Where do labeled frames go?", "Why include not-death examples?", "Who should be allowed to label data?"]
        },
        {
          title: "ML Model Workflow",
          summary: "A model workflow usually means collect data, split train/validation, train, evaluate, inspect errors, and iterate.",
          concepts: [
            "Training teaches the model from labeled examples.",
            "Validation checks performance on examples the model did not train on.",
            "False positives create extra bad markers. False negatives miss real deaths.",
            "The review UI should let humans correct model output."
          ],
          unity: "Think of ML as a behavior trained from examples instead of a hand-coded if-statement. You still need tests and tuning.",
          walkthrough: [
            "Read `death_model.py` to see how the current project structures model logic.",
            "Find UI for reporting a bad auto scan.",
            "Find development frame labeling from active VOD review."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\death_model.py`, `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\app\\actions.ts`],
          exercise: "Write an error review checklist for 20 predicted deaths: correct, duplicate, late/early, false positive, missed death.",
          review: ["What is validation for?", "Which is worse for the current workflow: false positives or false negatives?", "How can UI help improve the model?"]
        },
        {
          title: "Precision, Recall, and F1",
          summary: "These metrics describe model quality. They matter because detection is not just right/wrong; the kind of mistake changes user trust.",
          concepts: [
            "Precision: of the frames marked death, how many really were deaths?",
            "Recall: of the real deaths, how many did we find?",
            "F1: a single score balancing precision and recall.",
            "Threshold tuning can trade precision for recall."
          ],
          unity: "Precision is avoiding bad hits. Recall is catching all true hits. F1 is a combined scoreboard.",
          walkthrough: [
            "Use a small table: true positives, false positives, false negatives.",
            "Compute precision = TP / (TP + FP).",
            "Compute recall = TP / (TP + FN)."
          ],
          files: [`${PROJECT_ROOT}\\src\\vod_review_bot\\death_model.py`],
          exercise: "If the model predicts 30 deaths, 24 are real, and it missed 6 real deaths: compute precision, recall, and F1.",
          review: ["What does false positive mean?", "What does false negative mean?", "Why might reviewers prefer higher precision?"]
        }
      ],
      quiz: [
        { q: "What source value identifies automatic death markers?", options: ["auto", "reviewer", "oauth"], answer: 0 },
        { q: "Precision asks...", options: ["How many predicted deaths were real?", "How many users logged in?", "How many VODs are public?"], answer: 0 },
        { q: "Why label not-death frames?", options: ["So the model learns what to reject", "So Prisma can migrate", "So Discord commands sync"], answer: 0 }
      ],
      test: "Design a human-in-the-loop death detection review process for public testing."
    },
    {
      id: "ui-ux",
      title: "UI/UX Polish",
      goal: "Learn how Voddy's interface is organized for dense, fast, practical review instead of decorative marketing pages.",
      lessons: [
        {
          title: "Panels, Buttons, and Modals",
          summary: "Voddy uses panels, compact buttons, modal confirmations, and tabbed marker views to support repeated review work.",
          concepts: [
            "Panels group related workflow controls.",
            "Buttons trigger clear commands: add feedback, add death, assign, queue scan, clear all.",
            "Modals focus attention for forms and destructive confirmations.",
            "Tabs separate feedback, deaths, and drawings without losing the current VOD context."
          ],
          unity: "This is tool UI design, closer to a custom Unity editor window than a game menu.",
          walkthrough: [
            "Open `components/ui.tsx` and identify base UI pieces.",
            "Open `VodDetailWorkspace` and find `Modal` and tabs.",
            "Open `settings-panel.tsx` for settings tabs and controls."
          ],
          files: [`${WEB_ROOT}\\components\\ui.tsx`, `${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\components\\settings-panel.tsx`],
          exercise: "Pick one modal and explain why it should or should not be inline instead.",
          review: ["Why use panels?", "Why use confirmation flows?", "When are tabs useful?"]
        },
        {
          title: "Dashboard Design",
          summary: "The dashboard is an operational view: filters, VOD cards, submit panel, stats, pins, and guild context.",
          concepts: [
            "The dashboard prioritizes scanning and filtering over storytelling.",
            "VOD cards summarize enough data to choose a review target.",
            "Pinned VODs rise to the top for quick access.",
            "Stats give reviewers and officers a lightweight health snapshot."
          ],
          unity: "This resembles an editor browser/search window for review assets.",
          walkthrough: [
            "Open dashboard page and identify dashboard filters, card list, stats sidebar, and submit panel.",
            "Open `VodCard` and list the information shown.",
            "Open `DashboardFilters` and identify query parameters."
          ],
          files: [`${WEB_ROOT}\\app\\page.tsx`, `${WEB_ROOT}\\components\\vod-card.tsx`, `${WEB_ROOT}\\components\\dashboard-filters.tsx`],
          exercise: "Choose one extra dashboard filter and describe the query parameter, Prisma filter, and UI control it would need.",
          review: ["Why is dense UI appropriate here?", "What does pinning solve?", "What should VOD cards avoid showing?"]
        },
        {
          title: "Themes, Cursors, and Settings",
          summary: "Visual preferences live mostly in browser-local state so users can customize feel without changing server data.",
          concepts: [
            "Theme/controller components apply CSS classes and localStorage preferences.",
            "Keyboard shortcuts are configurable and stored locally.",
            "Settings are split into visual, controls, review defaults, and account/admin areas.",
            "Local preferences are good for personal UI; database settings are better for shared guild rules."
          ],
          unity: "LocalStorage preferences are like client-side PlayerPrefs. Guild settings are shared server config.",
          walkthrough: [
            "Open theme controller and settings panel.",
            "Open keybinds helpers.",
            "Identify which settings affect only the browser and which affect the database."
          ],
          files: [`${WEB_ROOT}\\components\\theme-controller.tsx`, `${WEB_ROOT}\\components\\settings-panel.tsx`, `${WEB_ROOT}\\lib\\keybinds.ts`],
          exercise: "Classify five settings as local preference or database setting.",
          review: ["What should go in localStorage?", "What should go in the database?", "Why let users change keybinds?"]
        },
        {
          title: "Making Tools Feel Usable",
          summary: "Good review tools reduce friction: fewer clicks, readable density, predictable controls, clear feedback, and safe destructive actions.",
          concepts: [
            "Reviewers need speed because they repeat the same actions many times.",
            "Buttons should be close to the context they affect.",
            "Dangerous actions need confirmation and clear wording.",
            "Polish is not just color; it is also layout stability, empty states, responsiveness, and readable labels."
          ],
          unity: "The best editor tools feel boring in a good way: obvious, fast, hard to misuse.",
          walkthrough: [
            "Review clear-all confirmation flow in VOD workspace.",
            "Review empty states for feedback/deaths/jobs.",
            "Resize mentally: what happens on mobile and desktop?"
          ],
          files: [`${WEB_ROOT}\\components\\vod-detail-workspace.tsx`, `${WEB_ROOT}\\app\\globals.css`],
          exercise: "Find one UI area that could be faster for reviewers and write a small improvement proposal.",
          review: ["What makes destructive actions safe?", "Why do empty states matter?", "Why is layout stability important?"]
        }
      ],
      quiz: [
        { q: "Voddy's UI should mainly feel...", options: ["Operational and fast", "Like a marketing landing page", "Like a blank API"], answer: 0 },
        { q: "Browser-local settings are similar to Unity...", options: ["PlayerPrefs", "NavMesh", "Animator Controller"], answer: 0 },
        { q: "Why use confirmation for clear-all actions?", options: ["They are destructive", "They are OAuth-only", "They improve Prisma types"], answer: 0 }
      ],
      test: "Review one page for usability and write three concrete improvements, each tied to a real workflow."
    },
    {
      id: "production",
      title: "Production and Reliability",
      goal: "Understand builds, linting, TypeScript, backups, logs, workers, deployment, and public testing risks.",
      lessons: [
        {
          title: "Builds, Linting, and TypeScript",
          summary: "Before deployment or public testing, the app should build cleanly and pass lint/type checks where practical.",
          concepts: [
            "`npm run build` runs Prisma generate and Next build.",
            "`npm run lint` checks for common code problems.",
            "TypeScript catches many mismatches before runtime.",
            "Python can be checked by importing/compiling modules."
          ],
          unity: "This is like making sure the Unity project compiles, scenes load, and editor warnings are not hiding broken references.",
          walkthrough: [
            "Read `web/package.json` scripts.",
            "Read project context for the Windows Prisma DLL lock build quirk.",
            "Know that dev server may need stopping before production build on Windows."
          ],
          files: [`${WEB_ROOT}\\package.json`, `${PROJECT_ROOT}\\CODEX_CONTEXT.md`],
          exercise: "Write a release checklist with lint, build, bot import/compile, and manual smoke tests.",
          review: ["What does `npm run build` include?", "Why can Windows Prisma builds fail while dev server is running?", "What does lint catch?"]
        },
        {
          title: "Backups and Data Safety",
          summary: "The SQLite database is a single important file. Backups and careful destructive actions matter.",
          concepts: [
            "The database lives under `data` and has backup snapshots.",
            "VOD deletion cascades to markers and replies.",
            "Archive/restore is safer than permanent delete for normal workflow.",
            "Public testing needs backups before schema changes or destructive tools."
          ],
          unity: "Treat the DB like a production save file. You do not experiment on the only copy.",
          walkthrough: [
            "Find backup database files.",
            "Find `archiveVod`, `restoreVod`, and `deleteVod` actions.",
            "Find bot clear-all confirmation flow."
          ],
          files: [`${PROJECT_ROOT}\\data`, `${WEB_ROOT}\\app\\actions.ts`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`],
          exercise: "Write a manual backup procedure before changing the schema.",
          review: ["Why is archive safer than delete?", "What data cascades when a VOD is deleted?", "When should backups happen?"]
        },
        {
          title: "Logs and Background Workers",
          summary: "Logs explain what happened after the fact. Background workers handle slow tasks like video/death scanning.",
          concepts: [
            "Bot logs and web logs exist in project folders.",
            "Death detection runs as a bot-started background task currently.",
            "Long-running work should report status and progress in the database.",
            "A future worker/service could run separately from the bot for reliability."
          ],
          unity: "Logs are your console history in production. Workers are separate systems that keep heavy jobs away from the main UI loop.",
          walkthrough: [
            "Find bot and web log files.",
            "Read `DeathDetectionService(...).run_forever()` startup.",
            "Find `DeathDetectionJob` schema and UI progress display."
          ],
          files: [`${PROJECT_ROOT}\\bot.log`, `${PROJECT_ROOT}\\web-dev.log`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`, `${WEB_ROOT}\\prisma\\schema.prisma`],
          exercise: "Write what you would log for a failed death scan job.",
          review: ["Why use background jobs?", "Where is job progress stored?", "Why might death detection become a separate service?"]
        },
        {
          title: "Deployment and Public Testing",
          summary: "Deployment means making the bot, web app, environment variables, database, and public URL work together reliably.",
          concepts: [
            "Web app needs environment variables such as database URL, auth secret, Discord client credentials, redirect URI, and public app URL.",
            "Discord Developer Portal must have matching OAuth redirect URL and bot permissions/scopes.",
            "The bot needs token, database path, and network/process uptime.",
            "Public testing can break on permissions, OAuth callback mismatch, database locks, provider video quirks, and missing backups."
          ],
          unity: "Deployment is the difference between play mode on your machine and a build your guild can actually use.",
          walkthrough: [
            "Review README quick start and project context.",
            "List required env vars from config/auth files.",
            "Identify manual smoke tests: login, guild switch, submit, review, bot command, private VOD, queue scan."
          ],
          files: [`${PROJECT_ROOT}\\README.md`, `${PROJECT_ROOT}\\src\\vod_review_bot\\config.py`, `${WEB_ROOT}\\lib\\discord-auth.ts`, `${WEB_ROOT}\\next.config.ts`],
          exercise: "Create a public test plan with ten steps and expected results.",
          review: ["What must match for OAuth redirects?", "What does the bot need to run?", "What are likely public-testing failure points?"]
        }
      ],
      quiz: [
        { q: "Which script builds the web app?", options: ["npm run build", "npm run oauth", "python build.ts"], answer: 0 },
        { q: "Why are backups important?", options: ["SQLite DB is critical state", "They make CSS faster", "They sync slash commands"], answer: 0 },
        { q: "Where should long-running scan progress be stored?", options: ["Database job row", "Only browser memory", "Only CSS"], answer: 0 }
      ],
      test: "Write a one-page deployment readiness checklist."
    },
    {
      id: "capstone",
      title: "Practical Capstone",
      goal: "Practice a small full-stack feature across schema, actions, UI, bot awareness, and verification.",
      lessons: [
        {
          title: "Feature Brief: Review Priority",
          summary: "Add a small priority field to VODs so reviewers can mark urgent reviews and sort/filter them.",
          concepts: [
            "A full-stack feature touches the database, input forms, server actions, UI display, filters, and tests/build checks.",
            "Small does not mean trivial: every layer must agree on field names and allowed values.",
            "Use conservative values: Low, Normal, High.",
            "Default should be Normal so existing rows behave sensibly."
          ],
          unity: "This is like adding a serialized field to a gameplay object and updating inspector UI, save loading, gameplay logic, and tests.",
          walkthrough: [
            "Plan data shape: Prisma `priority String @default('Normal')`, SQLite column `priority TEXT NOT NULL DEFAULT 'Normal'`.",
            "Plan UI: submit/edit select, VOD card badge, dashboard filter/sort.",
            "Plan actions: parse and validate priority from FormData."
          ],
          files: [`${WEB_ROOT}\\prisma\\schema.prisma`, `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`, `${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\components\\vod-card.tsx`],
          exercise: "Write the exact acceptance criteria before touching code.",
          review: ["What default should old VODs get?", "Which layers need updating?", "Why validate allowed priority values?"]
        },
        {
          title: "Database Change",
          summary: "Start with the database because every other layer depends on the field existing.",
          concepts: [
            "Update Prisma schema first for the web app.",
            "Update Python storage migration/ensure-columns so the bot can run with existing DBs.",
            "Consider whether Discord command submission should expose the field now or default it.",
            "Regenerate Prisma client after schema change."
          ],
          unity: "This is like updating save schema and migration code before loading old saves.",
          walkthrough: [
            "Add `priority` to `model Vod`.",
            "Add storage column creation in `_ensure_columns` or table definition.",
            "Verify existing data gets default Normal."
          ],
          files: [`${WEB_ROOT}\\prisma\\schema.prisma`, `${PROJECT_ROOT}\\src\\vod_review_bot\\storage.py`],
          exercise: "Write a migration note explaining how old rows get the new field.",
          review: ["Why update both Prisma and Python storage?", "Why set a default?", "When is a migration needed?"]
        },
        {
          title: "Server Action and UI Change",
          summary: "Once data exists, wire it into creation, editing, filtering, cards, and detail views.",
          concepts: [
            "Server actions should normalize/validate values.",
            "Forms need a select control with known options.",
            "Cards and detail pages should show priority compactly.",
            "Dashboard filter should become a URL query parameter and Prisma `where` condition."
          ],
          unity: "This is inspector UI plus runtime display plus command validation.",
          walkthrough: [
            "Add a helper such as `priorityValue(formData)`.",
            "Update `createVod` and `updateVod`.",
            "Update `VodSubmitForm`, `VodEditButton`, `VodCard`, and dashboard filters."
          ],
          files: [`${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\components\\vod-submit-form.tsx`, `${WEB_ROOT}\\components\\vod-edit-button.tsx`, `${WEB_ROOT}\\components\\dashboard-filters.tsx`, `${WEB_ROOT}\\components\\vod-card.tsx`],
          exercise: "Implement the UI in the smallest usable form: create/edit select and card badge first.",
          review: ["Why prefer a select over free text?", "Why should filters live in URL params?", "Where should validation live?"]
        },
        {
          title: "Verification and Reflection",
          summary: "Finish by testing the feature in ways that catch schema, UI, server, and old-data problems.",
          concepts: [
            "Run Prisma generate/build where possible.",
            "Smoke test creating a VOD with each priority.",
            "Smoke test filtering and editing.",
            "Check that bot-created VODs still work and default priority is Normal."
          ],
          unity: "This is your feature QA pass: new saves, old saves, UI, and edge cases.",
          walkthrough: [
            "Run the web build/lint appropriate to the project.",
            "Run Python import/compile checks if bot storage changed.",
            "Document what changed and what you verified."
          ],
          files: [`${WEB_ROOT}\\package.json`, `${PROJECT_ROOT}\\requirements.txt`, `${PROJECT_ROOT}\\CODEX_CONTEXT.md`],
          exercise: "Write a final capstone report: files changed, behavior added, verification run, known risks.",
          review: ["What is the old-data test?", "What is the bot compatibility test?", "What would you do if build fails due to Prisma DLL lock?"]
        },
        {
          title: "Part 2: Bonus Feature Lab",
          summary: "After the guided priority feature, you will choose several small bonus features and implement them yourself with less hand-holding.",
          concepts: [
            "The goal is repetition: each feature should touch a small number of layers so you practice the web stack without getting buried.",
            "Choose three to five minor features, not one giant redesign.",
            "For every feature, write acceptance criteria before coding.",
            "After every feature, run the smallest useful verification: type check/build/lint when relevant plus a manual smoke test."
          ],
          unity: "This is like a Unity learning project where you add several small mechanics after the tutorial: one UI toggle, one saved field, one filter, one quality-of-life button.",
          walkthrough: [
            "Pick features from the next lesson's menu.",
            "For each one, identify whether it is UI-only, database-backed, bot-aware, or permission-sensitive.",
            "Implement one feature at a time and write a short mini-report before moving on."
          ],
          files: [`${WEB_ROOT}\\app\\actions.ts`, `${WEB_ROOT}\\components`, `${WEB_ROOT}\\prisma\\schema.prisma`, `${PROJECT_ROOT}\\src\\vod_review_bot`],
          exercise: "Choose three bonus features now. Rank them easiest to hardest and write why each one belongs in the project. For each one, also write whether you want Codex to act as a tutor, reviewer, or pair-programmer.",
          review: ["Why should bonus features stay small?", "What should you write before coding?", "When does a feature need a database change?"]
        },
        {
          title: "Bonus Feature Menu",
          summary: "Use this menu to pick several minor additions. The best choices are small, useful, and tied to real reviewer workflow.",
          concepts: [
            "UI-only ideas: compact mode toggle, hide reviewed VODs toggle, default open tab preference, marker density setting, dashboard card view/list view toggle.",
            "Database-backed ideas: VOD priority, reviewer due date, player preferred role, review difficulty rating, post-review confidence score.",
            "Workflow ideas: duplicate VOD URL warning, quick mark as reviewed after adding feedback, one-click copy summary, recent-review history panel, feedback template dropdown.",
            "Bot-aware ideas: `/vod priority`, `/vod mine needs_review`, `/vod reviewer_queue`, `/vod quick_summary`, or optional priority in `/vod submit`.",
            "Guidance level: each option gives you a suggested path, likely files, and checkpoints, but you still choose the exact UI and code changes."
          ],
          unity: "Think in small components: one new serialized field, one inspector control, one menu item, one validation rule.",
          walkthrough: [
            "Pick at least one UI-only feature so you can practice React state/localStorage without schema work.",
            "Pick at least one database-backed feature so you practice Prisma and server actions.",
            "Optionally pick one bot-aware feature so you practice keeping Python and TypeScript aligned."
          ],
          files: [`${WEB_ROOT}\\components\\settings-panel.tsx`, `${WEB_ROOT}\\components\\vod-card.tsx`, `${WEB_ROOT}\\components\\dashboard-filters.tsx`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`],
          exercise: "Select your final bonus-feature set: one UI-only, one database-backed, and one workflow or bot-aware improvement. For each selected feature, copy the suggested path into your notes and turn it into your own checklist.",
          review: ["Which ideas avoid schema changes?", "Which ideas require both Prisma and Python storage?", "Which idea would help reviewers immediately?"]
        },
        {
          title: "Guided Bonus Feature Paths",
          summary: "These are semi-guided implementation paths for common bonus features. They tell you where to look and what to verify without giving you a complete copy-paste solution.",
          concepts: [
            "Compact Mode: store a local preference, add a setting toggle, apply a class/data attribute, reduce card spacing and metadata density, verify dashboard and VOD page still read well.",
            "Hide Reviewed Toggle: add a dashboard query param, update filters UI, update Prisma `where` logic, verify Reviewed and Needs Review views.",
            "Feedback Template Dropdown: add a small list of common note starters in the feedback form, insert selected text into the note field, verify manual text still works.",
            "Reviewer Due Date: add a nullable/default field to Vod, update Prisma/Python storage, add submit/edit controls, show badge on cards, add dashboard filter for overdue.",
            "Bot Reviewer Queue: add a slash command that lists unarchived Needs Review/In Review VODs assigned to the caller or unassigned, verify permissions and guild scoping."
          ],
          unity: "These are like guided mechanic cards: objective, likely scripts, implementation hints, and test cases, but you still write the mechanic.",
          walkthrough: [
            "Start with a UI-only path if React still feels new.",
            "Move to a database-backed path once Prisma and actions feel familiar.",
            "Only do a bot-aware path after you can explain how Python storage and Prisma share the schema.",
            "Ask Codex for hints first, then for review, before asking it to implement anything."
          ],
          files: [`${WEB_ROOT}\\app\\page.tsx`, `${WEB_ROOT}\\components\\dashboard-filters.tsx`, `${WEB_ROOT}\\components\\vod-card.tsx`, `${WEB_ROOT}\\components\\settings-panel.tsx`, `${PROJECT_ROOT}\\src\\vod_review_bot\\bot.py`],
          exercise: "Pick one guided path and write its implementation checklist with four sections: data, UI, behavior, verification.",
          review: ["Which path is safest for your first solo change?", "Which path forces schema alignment?", "Which path teaches Discord command design?"]
        },
        {
          title: "Independent Feature Template",
          summary: "Use the same checklist for every bonus feature so you build deliberately instead of guessing through files.",
          concepts: [
            "Feature name: one sentence describing what changes for the user.",
            "Acceptance criteria: three to five bullet points that define done.",
            "Files likely touched: page/component/action/schema/bot/test notes.",
            "Verification: exact command or manual path you will use to prove it works."
          ],
          unity: "This is the same discipline as writing a tiny task card before adding a Unity mechanic: behavior, inputs, saved data, UI, tests.",
          walkthrough: [
            "Copy the template from this lesson into your notes for each feature.",
            "Fill it out before opening code.",
            "After implementation, add a result section: what changed, what passed, what still worries you."
          ],
          files: [`${PROJECT_ROOT}\\CODEX_CONTEXT.md`, `${WEB_ROOT}\\package.json`, `${PROJECT_ROOT}\\requirements.txt`],
          exercise: "Fill this template for your first chosen bonus feature: Feature, User value, Acceptance criteria, Data changes, UI changes, Bot changes, Verification.",
          review: ["Why define acceptance criteria first?", "Why list likely files before coding?", "What does a good verification note include?"]
        },
        {
          title: "Final Capstone Review",
          summary: "The capstone ends when you can explain and demonstrate multiple small features that you designed, implemented, and verified yourself.",
          concepts: [
            "You should be able to explain every layer each feature touched.",
            "You should know which bugs you guarded against and which risks remain.",
            "You should be able to read build errors and connect them to TypeScript, Prisma, React, or Python.",
            "The final output is a short portfolio-style report plus working code."
          ],
          unity: "This is your postmortem: what you built, why it works, how you tested it, and what you would improve next.",
          walkthrough: [
            "Demo each feature in the running VOD Review Tool.",
            "For each feature, point to the exact files changed.",
            "Explain the data flow from user action to saved data or UI state.",
            "Run final verification and write a concise report."
          ],
          files: [`${WEB_ROOT}\\app`, `${WEB_ROOT}\\components`, `${WEB_ROOT}\\prisma\\schema.prisma`, `${PROJECT_ROOT}\\src\\vod_review_bot`],
          exercise: "Write your final capstone report with one section per bonus feature and one section for final verification.",
          review: ["Can you explain each feature without reading code?", "Can you trace data flow for each feature?", "Can you name one future improvement for each feature?"]
        }
      ],
      quiz: [
        { q: "A full-stack field change should start with...", options: ["Data model/defaults", "Button color only", "Deployment URL"], answer: 0 },
        { q: "Why update Python storage for a web schema change?", options: ["The bot shares the same database", "Python compiles TypeScript", "Discord reads CSS"], answer: 0 },
        { q: "What is the safest default for existing priority rows?", options: ["Normal", "High", "Delete"], answer: 0 }
      ],
      test: "Complete the Review Priority feature, then write a capstone report in your notes."
    }
  ]
};
