export enum MangaStatus {
  Unknown,
  Ongoing,
  Completed,
  Hiatus,
  Dropped
}

export const MangaStatusKeys = Object.keys(MangaStatus).filter(k => Number.isNaN(Number(k)));
export const MangaStatusValues = Object.values(MangaStatus).filter(v => !Number.isNaN(Number(v)));

export enum ReadingStatus {
  Unknown,
  Reading,
  Planned,
  OnHold = "On Hold",
  Dropped = "Dropped"
}

export const ReadingStatusKeys = Object.keys(ReadingStatus).filter(k => Number.isNaN(Number(k)));
export const ReadingStatusValues = Object.values(ReadingStatus).filter(v => !Number.isNaN(Number(v)));
