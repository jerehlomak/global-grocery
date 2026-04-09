import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Region } from "@/types/product"
import { REGIONS } from "@/types/product"

interface RegionState {
  region: Region
  setRegion: (region: Region) => void
  getCurrent: () => typeof REGIONS[0]
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      region: "USD",
      setRegion: (region) => set({ region }),
      getCurrent: () => REGIONS.find((r) => r.id === get().region) || REGIONS[0],
    }),
    { name: "globalgrocer-region" }
  )
)
