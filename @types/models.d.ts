import { MangaStatus, ReadingStatus } from "../src/constants";

declare global {
  interface Extension {
    domain: string;
    baseUrl: string;
    name: string;
    description?: string;
    language: string;
    version: string;
    isNsfw: boolean;

    hasUpdate?: boolean;
    isInstalled?: boolean;
  }

  interface Manga {
    id?: number;
    domain: string;
    addedAt?: number;
    updatedAt?: number;
    lastReadAt?: number;
    lastViewedAt?: number;
    path: string;
    coverUrl: string;
    customCoverUrl?: string;
    bannerUrl?: string;
    title: string;
    description?: string;
    status?: MangaStatus;
    readingStatus?: ReadingStatus;
    artists?: string[];
    authors?: string[];
    genres?: string[];
    chapters?: Chapter[];
  }

  interface Chapter {
    id?: number;
    mangaId?: string;
    domain: string;
    addedAt?: number;
    updatedAt?: number;
    publishedAt: number;
    downloadedAt?: number;
    lastReadAt?: number;
    lastReadPage?: number;
    readCount?: number;
    path: string;
    name: string;
    pages?: string[];
    pageCount?: number;
    isDownloaded?: boolean;

    groups?: string[];
  }
}
