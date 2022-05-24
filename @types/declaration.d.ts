import { MangaStatus } from "../src/constants";

declare global {
  interface Component {
    mounted: { current: boolean };
    keepCommons?: boolean;
    ignoreStates?: string[];
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
    path: string;
    name: string;
    publishedAt: number;
    groups?: string[];
  }

  interface Manga {
    path: string;
    coverUrl: string;
    title: string;
    description?: string;
    status?: MangaStatus;
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
    id: string;
    page: number;
    hasNext: boolean;
    entries: Manga[];
    execDuration: number;
  }

  interface ApiChapterResponse {
    id: string;
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
