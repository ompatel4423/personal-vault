import { TagsSelector } from "@/components/ui/tags-selector";

const TAGS = [
  { id: "docker", label: "Docker" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "aws", label: "AWS" },
  { id: "graphql", label: "GraphQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "redis", label: "Redis" },
  { id: "git", label: "Git" },
];

export function TagsSelectorDemo() {
  return (
    <div style={{ padding: "20px", maxWidth: "600px", width: "100%" }}>
      <TagsSelector tags={TAGS} />
    </div>
  );
}

export default { TagsSelectorDemo };
