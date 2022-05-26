import { MangaStatus, ReadingStatus } from "../src/constants";

declare global {
  interface Component {
    mounted: { current: boolean };
    keepCommons?: boolean;
    create?(): HTMLElement;
    destroy(): void;
    render?(): Promise<void> | void;
  }

  interface Route {
    name?: string;
    path: string;
    component: Component;
  }

  interface State<T = any> {
    data?: T;
    preventDefault?: boolean;
    lastBrowseContext?: BrowseContext;
  }

  interface Chapter {
    id?: number;
    mangaId?: string;
    sourceId: string;
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

  interface Manga {
    id?: number;
    sourceId: string;
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
    inLibrary?: boolean;
    artists?: string[];
    authors?: string[];
    genres?: string[];
    chapters?: Chapter[];
  }

  interface Filter {
    name: string;
    key: string;
    type?: string;
    options: { [key: string]: string };
  }

  interface ApiBrowseResponse {
    page: number;
    hasNext: boolean;
    entries: Manga[];
    execDuration: number;
  }

  interface ApiChapterResponse {
    entries: Chapter[];
    execDuration: string;
  }

  interface Extension {
    id: string;
    baseUrl: string;
    name: string;
    language: string;
    version: string;

    hasUpdate?: boolean;
    isInstalled?: boolean;
  }
}
