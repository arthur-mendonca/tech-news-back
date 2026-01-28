I will modify `ProcessorService` to implement a "Semantic Tag Matching" workflow that prioritizes your manually curated tags.

### 1. Retrieve & Index Existing Tags
In `ProcessorService.processArticle`, before generating metadata:
- Fetch all existing tags from the database using `this.prisma.tag.findMany()`.
- Create a normalized map (`Map<lowercase_name, original_name>`) to ensure exact case matching later.
- Prepare a comma-separated string of these tags to feed into the AI.

### 2. Upgrade AI Prompt (Semantic Matching)
Update the `generateObject` prompt to include the **Available Tags** list and specific instructions:
- **Analyze** the article content.
- **Match** against the provided list: "If the article talks about 'Apple Inc.' and 'Apple' is in the list, use 'Apple'".
- **Create** new tags only if no suitable tag exists in the list.
- **Format**: Keep tags short, simple, and consistent (e.g., "Startups", "Tesla").

### 3. Post-Process & Persist
Before saving to the database:
- **Normalize**: Iterate through the tags returned by the AI. Check each one against our `Map`. If a case-insensitive match is found (e.g. AI returned "javascript" but DB has "JavaScript"), replace it with the DB version.
- **Persist**: Use the existing `connectOrCreate` logic. This ensures that if the AI selected an existing tag (now normalized), it correctly links to it. If it created a truly new tag, it gets added to the DB.

This approach solves the fragmentation issue by using the LLM's semantic understanding to map variations (Apple Inc -> Apple) while enforcing consistency with your database.