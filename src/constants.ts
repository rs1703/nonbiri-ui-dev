export enum MangaStatus {
  Unknown,
  Ongoing,
  Completed,
  Hiatus,
  Dropped
}

export const MangaStatusKeys = Object.keys(MangaStatus).filter(k => Number.isNaN(Number(k)));
export const MangaStatusValues = Object.values(MangaStatus).filter(v => !Number.isNaN(Number(v)));
