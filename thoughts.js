/* ============================================================
   Your thoughts live here.

   Each entry is one cloud. Just ask Claude to add a new thought and
   it will drop a new entry into this array.

   Fields:
     question : short text shown on the cloud (required)
     date     : "YYYY-MM-DD" — sorts newest-first (optional)
     tags     : array of short labels (optional)
     answer   : the full written-out thought, in Markdown (required)
   ============================================================ */

window.THOUGHTS = [
  {
    question: "What are embeddings and vector search for LLMs?",
    date: "2026-10-01",
    tags: ["ai", "llms", "rag"],
    answer: `Embeddings and vector search are the two core technologies that let LLM-powered apps **find relevant information** before answering.

## 1. What is an embedding?

An embedding converts text into a list of numbers (a *vector*) that captures its **meaning**.

| Text | Simplified embedding |
|------|----------------------|
| "I love dogs" | [0.82, -0.11, 0.45, ...] |
| "Puppies are adorable" | [0.79, -0.09, 0.48, ...] |
| "Stock market crash" | [-0.32, 0.91, -0.41, ...] |

Real vectors are often **hundreds or thousands** of dimensions long. The key idea:

> Similar meanings produce vectors that sit **close together** in mathematical space.

So "I love dogs" and "Puppies are adorable" end up near each other even though they share almost no exact words.

## 2. Why not just search by keywords?

Traditional keyword search is literal:

\`\`\`
Search: "car"
  ✓ car insurance
  ✓ car dealership
  ✗ automobile repair      (missed)
  ✗ vehicle registration   (missed)
\`\`\`

Embedding search understands **meaning**:

\`\`\`
Search: "car"
  ✓ automobile repair
  ✓ vehicle registration
  ✓ SUV maintenance
  ✓ car insurance
\`\`\`

...because all of those concepts are close in vector space.

## 3. What is vector search?

Vector search finds the stored vectors **closest** to a query vector. Picture documents plotted in space:

\`\`\`
Dogs      Cats
    *
  *
*
                Cars
                   *
                    *
\`\`\`

A user asks "cute puppies" → convert to an embedding → return the nearest vectors:

- "Dogs are loyal pets"
- "Puppy training guide"
- "Best dog food"

## 4. How this works with LLMs (RAG)

Say you're building a company chatbot with \`employee_handbook.pdf\`, \`benefits.pdf\`, and \`vacation_policy.pdf\`.

1. **Split** the documents into chunks.
2. **Embed** each chunk into a vector and store it in a vector database.
3. **User asks:** "How many vacation days do I get?"
4. **Embed the question** and run a vector search for the closest chunks.
5. **Feed** the retrieved chunk to the LLM as context:

\`\`\`
Context:
Employees receive 15 PTO days...

Question:
How many vacation days do I get?
\`\`\`

Now the model answers accurately. This pattern is called **RAG** (Retrieval-Augmented Generation).

## 5. Why not just put everything in the prompt?

With 10,000 PDFs you can't fit it all in the context window. Vector search acts like a **librarian**: it finds the relevant documents and hands only those to the LLM.

## 6. Common vector databases

Pinecone · Weaviate · Qdrant · Milvus · Chroma · **pgvector** (a Postgres extension). Many teams start with **Postgres + pgvector** before moving to a dedicated vector DB.

## 7. iOS engineer analogy

Think of an embedding as:

\`\`\`
String → Embedding Model → [Float]
\`\`\`

...and vector search as:

\`\`\`swift
func findMostSimilar(
    query: [Float],
    documents: [[Float]]
) -> [Document]
\`\`\`

...using cosine similarity, returning the highest-scoring documents. The full pipeline:

\`\`\`
User Question → Generate Embedding → Vector Search
   → Relevant Documents → LLM → Answer
\`\`\`

---

## Zooming in: how "split" and "embed" actually work

### Step 1 — Split documents into chunks

You usually **don't** embed a whole document as one vector. If someone asks "How many PTO days do I get?", you don't want to retrieve the entire 50-page handbook. So you split it:

\`\`\`
Chunk 1:  Vacation Policy — 15 PTO days per year...
Chunk 2:  Health Benefits — medical coverage...
Chunk 3:  Remote Work — up to 3 days remote...
\`\`\`

Each chunk is typically **200–500 words / 500–1000 tokens**, often with **overlap** so important information isn't cut in half:

\`\`\`
Chunk 1:  Paragraphs 1–5
Chunk 2:  Paragraphs 4–8
Chunk 3:  Paragraphs 7–11
\`\`\`

### Step 2 — Generate embeddings

Each chunk is sent to an embedding model, which outputs a vector (maybe 1536 numbers):

\`\`\`
"Employees receive 15 PTO days per year."
    → [0.284, -0.891, 0.442, ...]
\`\`\`

You don't care what the individual numbers mean. What matters is that related ideas land close together — "PTO policy" and "vacation days" end up as near-neighbors.

**What the model is really doing** is a kind of *compression of meaning*. Conceptually (not literally), it turns the sentence into something like:

\`\`\`
{ topic: vacation, employment: yes, benefits: yes, time_off: high }
\`\`\`

...except represented as hundreds or thousands of numbers.

### What gets stored

Both the **original text** and its **vector**:

| Chunk text | Embedding |
|------------|-----------|
| PTO policy | [0.2, 0.8, ...] |
| Health benefits | [0.9, -0.1, ...] |
| Remote work | [-0.4, 0.7, ...] |

### At query time

The question "How much vacation do employees get?" becomes a vector close to the PTO chunk. The database ranks by similarity:

| Chunk | Similarity |
|-------|-----------|
| PTO Policy | 0.95 |
| Health Benefits | 0.42 |
| Remote Work | 0.11 |

...and returns the top match, which is handed to the LLM.

### The coding analogy

\`\`\`swift
struct Chunk {
    let text: String
    let embedding: [Float]
}

let queryEmbedding = embed(
    "How many vacation days do employees get?"
)

for chunk in chunks {
    score = cosineSimilarity(queryEmbedding, chunk.embedding)
}
// sort by score → return the highest
\`\`\`

The impressive part: **"vacation days" and "PTO" match even without sharing words**, because the embedding model learned those concepts are related and placed them near each other in vector space. That retrieval step is what lets AI assistants answer questions about your docs, codebase, Slack, or PDFs **without retraining the model**.`
  },

  {
    question: "Popularity of wifebeaters historically since inception, in a charted graph",
    date: "2026-09-15",
    tags: ["fashion", "history", "culture"],
    answer: `Here's an estimated popularity curve for the ribbed white A-shirt (the undershirt nicknamed the "wife-beater"), from its 1935 debut to today.

One caveat up front: no one tracks sales of this specific garment across 90 years, so the curve is an informed estimate built from documented milestones, not measured data.

The anchor points are well established. In 1935, Cooper's (later Jockey) introduced the jockey brief, then added a matching ribbed cotton tank undershirt it called the "A-shirt," short for athletic shirt. It became a wardrobe staple but was mostly worn underneath other clothes. The big jump came with Marlon Brando in the 1951 film *A Streetcar Named Desire*, after which the white tank worn as outerwear became shorthand for male virility, reinforced by De Niro in *Raging Bull*, Bruce Willis in *Die Hard*, and Vin Diesel in *Fast and Furious*. In the 1970s, Hanes rebranded it as the "A-shirt" to move it away from undergarment territory.

The nickname arrived later: it had entered some people's vocabulary by the late 1970s, with an early written use in a 1979 San Francisco Examiner article. That slang is now widely considered offensive, which is part of why "A-shirt" or "ribbed tank" is the usual retail name today — and part of the 2010s cool-off shown on the chart. The 2020s rise reflects its comeback as a fashion basic sold by designer and mass-market brands alike.

If you want harder numbers for the recent era, Google Trends search interest (2004 onward) for "tank top" vs. "A-shirt" vs. the slang term could be charted side by side.

## Why the peaks: 1951, 2001, 2023

A quick framing note: the 1951, 2001, and 2023 peaks are estimates — a reasoned explanation of why those periods plausibly drove demand, not proof that sales topped out in exactly those years. Each peak combines three things: a cheap garment, a body-display moment, and a cultural figure who made working-class clothing look authentic to people who weren't working class.

### 1951 — Postwar normalization meets Hollywood

**Economic drivers.** The GI generation came home used to wearing underwear as outerwear. During both World Wars, men got in the habit of wearing undergarments as clothes. That habit met a booming industrial economy full of factory, dock, and construction jobs, where a cheap cotton undershirt was practical work wear. Most homes also lacked air conditioning, so stripping down to a tank in hot city apartments was ordinary.

**Social drivers.** The garment already existed, but it was mostly worn as an undergarment, especially in wealthier areas. Brando's Stanley Kowalski changed what it meant — his Method-acting sexuality turned a laborer's undershirt into a symbol of raw masculinity. That set up a lasting pattern: middle-class men borrowing working-class signals. The same film also planted the violent association that later produced the nickname.

### 2001 — Hip-hop goes mainstream, basics get cheap

**Social drivers.** This was the moment hip-hop became the center of American pop culture, and the tank went with it. In the late 1990s and 2000s, artists like 50 Cent, Jennifer Lopez and Beyoncé wore white tank tops in many music videos, paired with baggy low-rise pants or denim minis — a de facto hip-hop uniform in the early aughts. The slang name itself peaked culturally here; the OED's Jesse Sheidlower dated the term to around 1997, from a confluence of rising rap, gay and gang subcultures. Women adopted it too, extending the market well beyond men's underwear.

**Economic drivers.** Late-90s offshoring had made multipacks of cotton basics extremely cheap, and the 2001 dot-com bust and recession favored inexpensive staples. A $10 three-pack was the most affordable way to buy into a high-status music-video look. Gym culture that rewarded visible arms helped too.

### 2023 — Luxury, nostalgia, and heat

**Social drivers.** The revival flipped the class signal. Designers began selling the same garment as a luxury item: on fall 2022 runways, Prada showed logo tanks, Bottega Veneta made leather versions, and Acne paired them with oversized pants. The roughly 20-year fashion nostalgia cycle brought Gen Z back to Y2K and 90s minimalism, and the "quiet luxury" aesthetic reinforced it. A plain tank photographs well and suits fit-check culture.

**Economic drivers.** High inflation pushed shoppers toward cheap, versatile basics, while the luxury versions offered a "stealth wealth" option. The same item now sells at both extremes — affordable versions in big-box stores and $300 styles at high-end retailers. One major supplier said men's tank tops were up 22% in 2022, and muscle tanks up 33%. 2023 was also the hottest year on record, which made a sleeveless layer practical.

## The common thread

| Era  | Who made it cool      | Class signal          | Economic backdrop          | Who wore it     |
|------|-----------------------|-----------------------|----------------------------|-----------------|
| 1951 | Hollywood (Brando)    | Working-class realness | Industrial boom, no AC     | Men             |
| 2001 | Hip-hop artists       | Street authenticity    | Cheap imports, recession   | Men and women   |
| 2023 | Runways, social media | Luxury minimalism      | Inflation, record heat     | Unisex          |

The garment itself barely changed in 90 years. What changed is who wore it and what it meant. Each peak happened when the A-shirt was cheap, matched the ideal body type of the moment, and had a strong pop-culture figure behind it. The dips (the 1960s, the 2010s) came when slimmer, more polished menswear took over and when the stigma attached to the nickname outweighed the tank's appeal. That stigma probably explains why the 2023 boom was marketed as the "ribbed tank" rather than by its old name.

## Sources

- [Why Are White Tank Tops Sometimes Called 'Wife-Beaters'? — Snopes](https://www.snopes.com)
- [How The White Tank Top Became 2022's Biggest Fashion Statement — Refinery29](https://www.refinery29.com)
- The white tank top has entered its era of resurgence — The Established
- How the 'Wife Beater' Tank Top Became A Marker of Class — MEL Magazine
- Why Are We Still Calling White Tank Tops "Wife-Beaters"? — Mic
- Classic White Tank Top 'Is the Hero of Your Outfit' — ASI Central
- The newest trend in fashion is a wardrobe staple you probably own — NPR
- Why Do We Call It a 'Tank Top'? — Word Smarts`
  }
];
