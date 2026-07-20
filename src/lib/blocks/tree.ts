import { ContentBlock } from "@/lib/page-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateBlockProps(
  blocks: ContentBlock[],
  blockId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
): ContentBlock[] {
  return blocks.map((b) => {
    if (b.id === blockId) return { ...b, props };
    if (b.children) return { ...b, children: updateBlockProps(b.children, blockId, props) };
    return b;
  });
}

export function removeBlock(blocks: ContentBlock[], blockId: string): ContentBlock[] {
  return blocks
    .filter((b) => b.id !== blockId)
    .map((b) => (b.children ? { ...b, children: removeBlock(b.children, blockId) } : b));
}

export function findBlock(blocks: ContentBlock[], blockId: string): ContentBlock | null {
  for (const b of blocks) {
    if (b.id === blockId) return b;
    if (b.children) {
      const found = findBlock(b.children, blockId);
      if (found) return found;
    }
  }
  return null;
}

export function appendChild(
  blocks: ContentBlock[],
  parentId: string,
  child: ContentBlock
): ContentBlock[] {
  return blocks.map((b) => {
    if (b.id === parentId) return { ...b, children: [...(b.children ?? []), child] };
    if (b.children) return { ...b, children: appendChild(b.children, parentId, child) };
    return b;
  });
}

export function moveChild(
  blocks: ContentBlock[],
  parentId: string,
  childId: string,
  direction: -1 | 1
): ContentBlock[] {
  return blocks.map((b) => {
    if (b.id === parentId && b.children) {
      const idx = b.children.findIndex((c) => c.id === childId);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= b.children.length) return b;
      const next = [...b.children];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...b, children: next };
    }
    if (b.children) return { ...b, children: moveChild(b.children, parentId, childId, direction) };
    return b;
  });
}
