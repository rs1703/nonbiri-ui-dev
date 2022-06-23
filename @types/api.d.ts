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
