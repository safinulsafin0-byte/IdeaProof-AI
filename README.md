## AI Provider

IdeaProof AI uses an NVIDIA Nemotron model (`nvidia/nemotron-3.5-super-vl`) through the OpenRouter OpenAI-compatible API.

### Why not Nebius Token Factory?
Nebius Token Factory was not accessible from Bangladesh during development:
- Bangladesh is not listed in the "Country of residence" field in Token Factory billing.
- A credit card was required to activate API access, which I do not have.
- I reached out to the hackathon organizers and the Nebius community on Discord on 19 October 2026 and did not receive a way to proceed in time.

### Switching to Nebius
The provider layer is OpenAI-compatible. Moving to Nebius Token Factory requires changing only three environment variables:

AI_BASE_URL=<Nebius Token Factory base URL>
AI_API_KEY=<Nebius API key>
AI_MODEL=<Nebius NVIDIA Nemotron model ID>

No application code changes are needed.

# IdeaProof AI

**Academic Research Idea Validation & Planning Platform**

IdeaProof AI is a specialized academic software tool engineered for researchers, graduate students, and principal investigators. Inspired by the visual restraint and clarity of Notion and Linear, the platform transforms early-stage research concepts into structured, publication-grade research design blueprints while cross-referencing ideas against 250M+ verified peer-reviewed papers via OpenAlex.

---

## Key Features

1. **Structured Research Analysis via High-Reasoning AI**
   - Integrates with **OpenRouter** (`https://openrouter.ai/api/v1`) using NVIDIA Nemotron models (default: `nvidia/nemotron-3-super-120b-a12b`, with support for `nvidia/nemotron-3-ultra-550b-a55b` and `meta-llama/llama-3.3-70b-instruct`).
   - Modular architecture allows swapping with **Nebius Token Factory** (`https://api.tokenfactory.nebius.com/v1`) or any OpenAI-compatible provider via environment variables without code modifications.
   - Generates publication-grade research titles, formal null and alternative hypotheses ($H_0, H_1$), multi-phase execution roadmaps with milestones, benchmark baselines, dataset specifications, evaluation metrics, and threats to validity.
   - Rigor calibration across three distinct scopes: **Undergraduate**, **Master's**, and **PhD**.

2. **Verified Academic Literature Grounding (OpenAlex)**
   - Directly queries the OpenAlex REST API across 250M+ cross-disciplinary scientific publications.
   - Extracts authentic metadata: real DOIs, verified publication years, exact author lists, publication venues, citation counts, and open-access PDF links.
   - **Zero Hallucination Guarantee:** AI hypothesis generation is strictly segregated from verified empirical literature. The platform never fabricates DOIs, citations, or paper titles.

3. **Interactive Literature Explorer**
   - Search scientific records by keywords, disciplines, or authors.
   - Real-time filters for publication year range and open-access status.
   - One-click formatted APA 7th Edition citation copying.
   - **Seed Idea Analysis:** Formulate an idea validation query directly from any discovered paper.

4. **Academic Export & Browser-to-PDF Formatting**
   - **Markdown Export:** Download comprehensive `.md` research validation briefs ready for GitHub, Notion, or Obsidian.
   - **Print-to-PDF Styling:** Custom `@media print` stylesheets strip away navigation bars, action buttons, and sidebars, optimizing margins and typography for clean browser PDF generation.

5. **Restrained Academic Design & Hydration Safety**
   - Warm off-white canvas (`#FAFAF8`), dark charcoal typography, neutral borders, and subtle shadows.
   - Built with SSR-safe state derivation (`useSyncExternalStore`) to ensure 100% hydration consistency between server and client.
   - Pre-loaded demonstration benchmark projects for instant onboarding and evaluation without an API key.

---

## AI Provider Architecture & Nebius Token Factory Migration Note

### Permanent Default Provider: OpenRouter (NVIDIA Nemotron)
IdeaProof AI operates with **OpenRouter** (`https://openrouter.ai/api/v1`) as its verified default AI provider, running NVIDIA Nemotron models:
- `nvidia/nemotron-3-super-120b-a12b` (Default recommended high-capacity reasoning model)
- `nvidia/nemotron-3.5-super-vl:free` (Free-tier NVIDIA Nemotron option available without paid credits)
- `nvidia/nemotron-3-ultra-550b-a55b` (Ultra-scale 550B reasoning model)

All inference requests are processed strictly server-side through Next.js App Router API endpoints (`/api/analyze`, `/api/test-provider`, `/api/status`). API keys are never bundled, transmitted, or logged on the client.

### Transparent Hackathon Disclosure: Nebius Token Factory Access
In the spirit of complete transparency and academic integrity for hackathon evaluation:
- Direct access to Nebius Token Factory was restricted during project development due to regional billing constraints and international payment card verification failures from Bangladesh.
- On 19 October 2026, attempts were made to contact hackathon organizers and community support channels regarding the regional billing barriers and card authorization limitations.
- Rather than fabricating synthetic responses or pretending Nebius Token Factory was active when direct account verification could not be completed, the application architecture was deliberately engineered around an OpenAI-compatible abstraction layer (`src/lib/ai-provider.ts`) and verified with OpenRouter serving genuine NVIDIA Nemotron models.
- **Zero-Code Nebius Migration:** Because Nebius Token Factory exposes an OpenAI-compatible API (`https://api.tokenfactory.nebius.com/v1`), switching from OpenRouter to Nebius Token Factory requires **zero code modifications**. Simply supplying Nebius credentials via environment variables seamlessly directs inference to Nebius:
  ```bash
  NEBIUS_API_KEY=your_nebius_api_key
  NEBIUS_MODEL=nvidia/nemotron-3-super-120b-a12b
  ```
  Alternatively, generic overrides (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) can point to any compliant provider endpoint.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Library** | React 19 |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **AI Inference** | OpenRouter (`/chat/completions`) / Swappable Nebius Token Factory |
| **Academic Index** | OpenAlex REST API |
| **Deployment Target** | Vercel / Node.js Server |

---

## Project Structure

```text
ideaproof-ai/
├── src/
│   ├── app/
│   │   ├── analysis/[id]/        # Dynamic analysis report view
│   │   ├── analyze/              # New research idea formulation form
│   │   ├── api/
│   │   │   ├── analyze/          # Server-side inference & OpenAlex search
│   │   │   ├── literature/       # OpenAlex proxy search route
│   │   │   ├── status/           # Provider connectivity & masked status
│   │   │   ├── test-provider/    # Active provider connectivity test
│   │   │   └── test-nebius/      # Backward-compatible diagnostic endpoint
│   │   ├── literature/           # Literature Explorer page
│   │   ├── research/             # Workspace saved projects list
│   │   ├── settings/             # API configuration & preferences
│   │   ├── layout.tsx            # Root App Router layout
│   │   └── page.tsx              # Research Workspace Dashboard
│   ├── components/
│   │   ├── analysis/             # Form & report view components
│   │   ├── dashboard/            # Project table & empty state components
│   │   ├── layout/               # Sidebar & Header components
│   │   ├── literature/           # Literature search & paper card components
│   │   ├── settings/             # Settings & API management view
│   │   └── ui/                   # Reusable Button, Badge, and input elements
│   ├── lib/
│   │   ├── ai-provider.ts        # Modular OpenAI-compatible provider adapter
│   │   ├── demo-data.ts          # Pre-validated demonstration benchmarks
│   │   ├── nebius.ts             # Backward-compatible provider exports
│   │   ├── openalex.ts           # OpenAlex REST API client
│   │   ├── storage.ts            # Local storage persistence helpers
│   │   └── use-mounted.ts        # SSR-safe client mounting hook
│   └── types/
│       └── research.ts           # TypeScript domain definitions
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── README.md                     # Documentation
```

---

## Getting Started

### Prerequisites

- Node.js `18.18+` or `20.x+`
- `npm`, `pnpm`, or `yarn`

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <your-repository-url> ideaproof-ai
cd ideaproof-ai
npm install
```

### 2. Environment Configuration

Copy the example environment configuration file:

```bash
cp .env.example .env.local
```

Edit `.env.local` to configure your credentials:

```bash
# Primary AI Provider: OpenRouter (Server-side only)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b
# Or use the free-tier model:
# OPENROUTER_MODEL=nvidia/nemotron-3.5-super-vl:free

# Optional: Endpoint override (defaults to https://openrouter.ai/api/v1)
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

> **Security Note:** Never commit `.env.local` or any file containing secret keys to version control. The repository `.gitignore` is configured to exclude all `.env*` files except `.env.example`.

#### Swapping to Nebius Token Factory

To route inference through Nebius Token Factory instead, configure these variables in `.env.local`:

```bash
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_MODEL=nvidia/nemotron-3-super-120b-a12b
```

> **Evaluation Mode:** If no API key is configured, the application functions in demonstration mode using pre-validated research benchmarks clearly labeled as `DEMO DATA`.

### 3. Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Linting

Run ESLint:

```bash
npm run lint
```

Build the production application:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start
```

---

## Environment Variables Reference

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Yes (for live inference) | — | Secret API key from OpenRouter. Kept strictly server-side. |
| `OPENROUTER_MODEL` | No | `nvidia/nemotron-3-super-120b-a12b` | Target model identifier on OpenRouter. |
| `OPENROUTER_BASE_URL` | No | `https://openrouter.ai/api/v1` | Custom base URL for OpenRouter or compatible proxies. |
| `NEBIUS_API_KEY` | Optional (alternative) | — | Secret API key for Nebius Token Factory. |
| `NEBIUS_MODEL` | Optional (alternative) | `nvidia/nemotron-3-super-120b-a12b` | Target model identifier on Nebius. |
| `AI_BASE_URL` | No | — | Generic base URL override for any OpenAI-compatible provider. |
| `AI_API_KEY` | No | — | Generic API key fallback. |
| `AI_MODEL` | No | — | Generic model identifier fallback. |

*Note: All API keys are consumed solely by server-side App Router routes (`/api/analyze`, `/api/test-provider`, `/api/status`) and are never exposed to the client bundle.*

---

## Deployment to Vercel

IdeaProof AI is fully optimized for one-click deployment on [Vercel](https://vercel.com):

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket).
2. **Import the repository into Vercel**:
   - Framework Preset: **Next.js** (automatically detected)
   - Root Directory: `./` (leave default)
   - Build Command: `next build` (or leave default)
   - Output Directory: `.next` (leave default)
   - Install Command: `npm install` (or leave default)
3. **Configure Environment Variables** in the Vercel Project Settings:
   - `OPENROUTER_API_KEY` = `<your_openrouter_api_key>`
   - `OPENROUTER_MODEL` = `nvidia/nemotron-3-super-120b-a12b` (or `nvidia/nemotron-3.5-super-vl:free` for free tier)
4. **Deploy:** Click **Deploy**. Vercel will build the project and assign a production URL.

---

## Known Limitations & Ethical Considerations

1. **Preliminary AI Gap Hypotheses:** AI-generated novelty gap assessments are exploratory hypotheses and should not replace exhaustive systematic literature reviews or expert peer consultation.
2. **Literature Retrieval Scope:** The OpenAlex API index covers 250M+ open scholarly works, but newly published or closed preprints may experience indexing delays.
3. **Inference Latency:** Frontier models (such as 120B/550B parameter MoEs) may take 15–30 seconds to generate complete, multi-section research methodologies. A progress indicator is displayed during generation.
4. **Rate Limits:** Free or low-tier provider tiers may enforce rate limits (HTTP 429). The application displays clear user-facing retry messages when rate limits are encountered.

---

## License

No license has been chosen yet. If you plan to make this project public on GitHub, consider adding an open-source license such as:
- **MIT License:** Permissive, popular for SaaS templates and open tools.
- **Apache 2.0 License:** Permissive with explicit patent rights and contributor terms.
