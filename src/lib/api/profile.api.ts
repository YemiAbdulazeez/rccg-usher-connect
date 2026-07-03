import type { Profile } from "../types";
import { api } from "./client";

export type ProfileFieldsPayload = Partial<{
  regionId: number;
  provinceId: number;
  zone: string;
  area: string;
  parish: string;
  designation: string;
  gender: string;
  dob: string;
  maritalStatus: string;
  whatsapp: string;
  homeAddress: string;
  occupation: string;
  employer: string;
  officeAddress: string;
  education: string;
  placeOfWork: string;
  yearJoinedRccg: string;
  yearJoinedUshers: string;
  ordinationType: string;
  ordinationYear: string;
  pastorInCharge: string;
  areaHqParish: string;
}>;

export const profileApi = {
  get: () => api.get<{ profile: Profile }>("/profile"),
  update: (fields: ProfileFieldsPayload) => api.put<{ profile: Profile }>("/profile", fields),
  submit: (fields: ProfileFieldsPayload) => api.post<{ profile: Profile }>("/profile/submit", fields),
  upload: (kind: "passport" | "signature", file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<{ kind: string; url: string }>(`/profile/uploads/${kind}`, form);
  },
};
