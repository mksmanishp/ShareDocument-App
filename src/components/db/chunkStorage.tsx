import { create } from 'zustand';
import { Buffer } from 'buffer';
interface Chunk {
  id: string | null;
  name?: string; // optional in currentChunkSet
  totalChunks: number;
  chunkArray: Buffer[];
  size: number;
  mimeType?: string;
}

interface ChunkState {
  chunkStore: Chunk | null;
  currentChunkSet: Omit<Chunk, 'name'> | null;

  setChunkStore: (chunkStore: Chunk | null) => void;
  resetChunkStore: () => void;

  setCurrentChunkSet: (chunkChunkSet: Omit<Chunk, 'name'> | null) => void;
  resetCurrentChunkSet: () => void;
}
export const useChunkStore = create<ChunkState>(set => ({
  chunkStore: null,
  currentChunkSet: null,

  setChunkStore: chunkStore => set(() => ({ chunkStore })),
  resetChunkStore: () => set(() => ({ chunkStore: null })),

  setCurrentChunkSet: currentChunkSet => set(() => ({ currentChunkSet })),
  resetCurrentChunkSet: () => set(() => ({ currentChunkSet: null })),
}));
