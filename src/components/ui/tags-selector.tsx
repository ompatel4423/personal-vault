"use client" 

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export type Tag = {
  id: string;
  label: string;
};

export type TagsSelectorProps = {
  tags: Tag[];
  selectedTags?: Tag[];
  onSelectedChange?: (tags: Tag[]) => void;
};

export function TagsSelector({ tags, selectedTags: controlledSelected, onSelectedChange }: TagsSelectorProps) {
  const [internalSelectedTags, setInternalSelectedTags] = useState<Tag[]>([]);
  const selectedTags = controlledSelected ?? internalSelectedTags;
  const selectedsContainerRef = useRef<HTMLDivElement>(null);

  const removeSelectedTag = (id: string) => {
    const updated = selectedTags.filter((tag) => tag.id !== id);
    if (!controlledSelected) {
      setInternalSelectedTags(updated);
    }
    onSelectedChange?.(updated);
  };

  const addSelectedTag = (tag: Tag) => {
    const updated = [...selectedTags, tag];
    if (!controlledSelected) {
      setInternalSelectedTags(updated);
    }
    onSelectedChange?.(updated);
  };

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [selectedTags]);

  return (
    <div className="p-4 max-w-lg w-full flex flex-col">
      <motion.h2 layout className="text-sm font-mono tracking-wider text-white/70 uppercase">
        FILTER TAGS
      </motion.h2>
      <motion.div
        className="w-full flex items-center justify-start gap-1.5 bg-black/40 border border-white/10 h-14 mt-2 mb-3 overflow-x-auto p-1.5 no-scrollbar backdrop-blur-md"
        style={{
          borderRadius: 16,
        }}
        ref={selectedsContainerRef}
        layout
      >
        {selectedTags.length === 0 ? (
          <span className="text-xs text-white/40 font-mono px-3">
            Select tags below to filter...
          </span>
        ) : (
          selectedTags.map((tag) => (
            <motion.div
              key={tag.id}
              className="flex items-center gap-1 pl-3 pr-1 py-1 bg-white/10 shadow-md border border-white/10 h-full shrink-0 backdrop-blur-md"
              style={{
                borderRadius: 14,
              }}
              layoutId={`tag-${tag.id}`}
            >
              <motion.span
                layoutId={`tag-${tag.id}-label`}
                className="text-white text-xs font-medium font-mono"
              >
                {tag.label}
              </motion.span>
              <button
                type="button"
                onClick={() => removeSelectedTag(tag.id)}
                className="p-1 rounded-full hover:bg-white/20 active:scale-90 transition-all"
              >
                <X className="size-3.5 text-white/70 hover:text-white" />
              </button>
            </motion.div>
          ))
        )}
      </motion.div>
      {tags.length > selectedTags.length && (
        <motion.div
          className="bg-black/30 shadow-sm p-2 border border-white/10 w-full backdrop-blur-md"
          style={{
            borderRadius: 16,
          }}
          layout
        >
          <motion.div className="flex flex-wrap gap-2">
            {tags
              .filter(
                (tag) =>
                  !selectedTags.some((selected) => selected.id === tag.id)
              )
              .map((tag) => (
                <motion.button
                  key={tag.id}
                  layoutId={`tag-${tag.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full shrink-0 active:scale-95 transition-all"
                  onClick={() => addSelectedTag(tag)}
                  style={{
                    borderRadius: 14,
                  }}
                >
                  <motion.span
                    layoutId={`tag-${tag.id}-label`}
                    className="text-white/80 text-xs font-mono font-medium"
                  >
                    {tag.label}
                  </motion.span>
                </motion.button>
              ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
