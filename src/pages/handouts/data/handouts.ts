// src/types/handout.ts
// src/types/handout.ts
// src/types/handout.ts
export interface Handout {
    id: string;
    slug: string;           // e.g. 'goblin-tribe'
    title: string;
    image: string;
    description?: string;
    tags?: string[];
    location?: string;
    foundBy?: string;
    session?: string;
    // Content?: React.ComponentType; // optional full notes
}

const context = (require as any).context('./', false, /\.md$/);

const handouts: Handout[] = context.keys().map((key: string) => {
    const module = context(key);
    const title = module.frontMatter.title;
    return {
        id: key,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        image: module.frontMatter.image,
        description: module.frontMatter.description,
        tags: module.frontMatter.tags,
        location: module.frontMatter.location,
        foundBy: module.frontMatter.foundBy,
        session: module.frontMatter.session,
        // Content: module.default,
    };
});
export default handouts;