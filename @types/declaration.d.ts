import { MangaStatus, ReadingStatus } from "../src/constants";

declare global {
  type Ref<T> = { current: T };

  interface Component {
    mountedRef: Ref<boolean>;
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

  interface Extension {
    id: string;
    baseUrl: string;
    name: string;
    language: string;
    version: string;

    hasUpdate?: boolean;
    isInstalled?: boolean;
  }

  interface Pair {
    key: string;
    value: string;
  }

  interface Option {
    key: string;
    value: string;
    defaultOption?: boolean;
  }

  interface Filter {
    key: string;
    excludedKey?: string;
    title: string;
    description?: string;
    type?: string;
    options: Option[];
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
    artists?: string[];
    authors?: string[];
    genres?: string[];
    chapters?: Chapter[];
  }

  interface HttpResponse<T> {
    status: number;
    content: T;
  }

  interface ApiBrowse {
    page: number;
    hasNext: boolean;
    entries: Manga[];
    execDuration: number;
  }

  interface ApiChapter {
    entries: Chapter[];
    execDuration: string;
  }

  interface BrowseContext {
    currentExtension?: Extension;
    extensions: Map<string, Extension>;
    installedExtensions: Map<string, Extension>;
    filters?: Set<Filter>;

    data?: ApiBrowse;
    entries: Manga[];
  }

  interface ViewContext {
    data?: Manga;
  }
}
