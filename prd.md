Weplit (ai + tldraw) is a collaborative infinite canvas tool based on [tldraw](https://github.com/tldraw/tldraw) that integrates **agentic AI** directly into the canvas experience. The AI is not a simple assistant — it's aware of every shape, connection, and text on the canvas and can **act** on your behalf: generating, transforming, analyzing, and organizing visual content.

Core features
### Canvas-Based Visual Editor (via tldraw)

You can serialize it for the AI, and you can render AI-generated objects back onto it.

- Shapes: rectangles, text, arrows, sticky notes, custom components
    
- Freehand drawing & snapping
    
- Real-time multiplayer editing (if desired)
    
- Zoom, pan, group, layers
all of tldraw

### AI Agent Sidebar

- A resizable sidebar containing:
    
    - Prompt input field
        
    - Agent menu with sample agents like summerize the canvas just a sample agent use case
    examples
        
    - Conversation/history log
    
    - Agent control panel (e.g., “Scope: selection | all canvas”)
### Agentic Capabilities

- Reads and interprets canvas content (text, spatial layout, relationships)
    
- Generates visual content (new shapes, connected diagrams)
    
- Executes transformations (e.g., “Summarize this mind map”, “Convert to pros/cons list”)
    
- Supports agents that can recursively act (plan + execute)

### Canvas-to-AI Data Flow

- On demand or in real-time: the AI receives a structured JSON of the current canvas (or a selected portion), with:
    
    - Object type
        
    - Position/size
        
    - Text content
        
    - Relationships (e.g., connected arrows)
        
- AI responses are interpreted and rendered as tldraw updates

## Architecture

### Frontend

- **Framework**: Next.js + TypeScript
    
- **Canvas**: [tldraw](https://github.com/tldraw/tldraw) as base
    
- **State Management**: Zustand 
    
- **Styling**: Tailwind CSS
    
- **AI UI**: Sidebar + floating controls (like a command palette or right-click AI menu)
### AI Backend

- **LLM Provider**: OpenRouter (e.g., GPT-4o, Claude 3, etc.)
    
- **Embedding & Memory**: Supabase with pgvector or Pinecone for persistent canvas memory
    
- **Agentic Framework**: LangGraph or custom executor (to manage multiple agent actions, loops, and canvas updates)
## MVP Feature Set (V0.1)

| Feature                           | Description                             |
| --------------------------------- | --------------------------------------- |
| Basic tldraw canvas               | Add/modify shapes, arrows, and text     |
| Sidebar AI chat                   | Prompt field + button actions           |
| Export canvas to AI-readable JSON | Selection or full canvas                |
| Agent: “Summarize This Area”      | Generates a TL;DR of selected shapes    |
| Agent: “Create Mind Map”          | From list of concepts or text blob      |
| Agent: “Visualize This”           | Turn paragraph into a flowchart         |
| Render AI output on canvas        | Parse and insert shapes, text, lines    |
| Save/load canvas state            | Optional with Supabase or local storage |

## Error Handling

- **Invalid AI Output**: Fallback to JSON schema validation before canvas update
    
- **Ambiguous selection**: Prompt user to refine selection area
    
- **Timeouts/Delays**: Display spinner, allow cancel, retry
    
- **Conflict on multiplayer**: Optimistic UI + conflict resolution via diff/merge


## Monetization

### B2C Freemium SaaS

- Free: 3 canvases, limited AI requests
    
- Pro: $12–$20/month → unlimited canvases, agent plugins, higher-tier models
    

### B2B Team Plan

- $10/user/month → team collaboration, admin controls, audit logs
    

### Enterprise

- Custom integrations, dedicated AI models, on-prem deployment

