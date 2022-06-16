export enum MangaStatus {
  None,
  Ongoing,
  Completed,
  Hiatus,
  Cancelled
}

export const MangaStatusText = ["None", "Ongoing", "Completed", "Hiatus", "Cancelled"];

export enum ReadingStatus {
  None,
  Reading,
  Planned,
  OnHold,
  Dropped
}

export const ReadingStatusText = ["None", "Reading", "Planned", "On Hold", "Dropped"];

export const Paths = {
  metadata: "/api/metadata",
  chapters: "/api/chapters",
  setMangaReadState: "/api/library/manga/readState"
};
