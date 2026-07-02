import type { HierarchyNode } from "../types";
import { api } from "./client";

export const hierarchyApi = {
  regions: () => api.get<{ regions: HierarchyNode[] }>("/hierarchy/regions"),
  provinces: (regionId: number) =>
    api.get<{ provinces: HierarchyNode[] }>(`/hierarchy/regions/${regionId}/provinces`),
  zones: (provinceId: number) =>
    api.get<{ zones: HierarchyNode[] }>(`/hierarchy/provinces/${provinceId}/zones`),
  areas: (zoneId: number) => api.get<{ areas: HierarchyNode[] }>(`/hierarchy/zones/${zoneId}/areas`),
  parishes: (areaId: number) =>
    api.get<{ parishes: HierarchyNode[] }>(`/hierarchy/areas/${areaId}/parishes`),
};
