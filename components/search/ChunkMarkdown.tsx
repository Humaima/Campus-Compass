import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { content: string };

// Knowledge docs use GFM tables/bold/lists (see knowledge/*.md), so the
// chunk's raw markdown needs real rendering — printing it as plain text
// left literal "##", "|", "**" characters in the answer card.
const components: Components = {
  h1: ({ children }) => <h4 className="font-bold text-base mt-3 first:mt-0">{children}</h4>,
  h2: ({ children }) => <h4 className="font-bold text-base mt-3 first:mt-0">{children}</h4>,
  h3: ({ children }) => <h5 className="font-bold text-sm mt-2">{children}</h5>,
  p: ({ children }) => <p className="text-sm mt-2 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="text-sm mt-2 list-disc pl-5 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="text-sm mt-2 list-decimal pl-5 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  table: ({ children }) => (
    <div className="mt-2 overflow-x-auto">
      <table className="text-sm border-collapse border-2 border-navy">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gold">{children}</thead>,
  th: ({ children }) => <th className="border border-navy px-2 py-1 text-left font-bold">{children}</th>,
  td: ({ children }) => <td className="border border-navy px-2 py-1">{children}</td>,
  a: ({ children, href }) => (
    <a href={href} className="underline font-bold" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

// Every knowledge/*.md file opens with a single leading "# <title>" line
// that duplicates the source title already shown in the citation footer —
// stripped so the answer body doesn't repeat it.
function stripLeadingTitle(content: string): string {
  return content.replace(/^#\s+.*\n+/, "");
}

export default function ChunkMarkdown({ content }: Props) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {stripLeadingTitle(content)}
      </ReactMarkdown>
    </div>
  );
}
