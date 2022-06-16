import Router from "./Router";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;

export const BuildURL = (pathname: string, params?: { [k: string]: any }) => {
  const url = new URL(window.location.origin);
  url.pathname = pathname;

  url.searchParams.set("domain", Router.getCurrentExtensionId());
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  if (!url.searchParams.has("path")) {
    url.searchParams.set("path", `/${window.location.pathname.split("/").slice(3).join("/")}`);
  }

  return decodeURIComponent(url.href);
};

export const CreateRef = <T>(value: T): Ref<T> => ({ current: value });

export const GenerateUniqueString = () => {
  let result = "_";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const FormatUnix = (unix: number) => {
  const time = new Date(unix);
  const month = (time.getMonth() + 1).toString().padStart(2, "0");
  const date = time.getDate().toString().padStart(2, "0");
  const year = time.getFullYear().toString().slice(-2);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  return `${month}/${date}/${year} ${hours}:${minutes}`;
};

export const FormatGroups = (groups: string[]) => {
  const lastGroupName = groups?.pop();
  return groups?.length ? `${groups.join(", ")} & ${lastGroupName}` : lastGroupName;
};

export const LoadImage = (url: string) =>
  new Promise((resolve, reject) => {
    let retryCount = 0;

    const exec = () => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => {
        if (retryCount++ < 3) exec();
        else reject(new Error("Failed to load image"));
      };

      img.src = url;
    };

    exec();
  });

export const SendRequest = async <T = any>(path: string, method = "GET", body?: any): Promise<HttpResponse<T>> =>
  new Promise<HttpResponse<T>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path);

    xhr.addEventListener("load", () => {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        let data: T;
        if (xhr.responseText) {
          try {
            data = JSON.parse(xhr.responseText);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
            return;
          }
        }
        resolve({ statusCode: xhr.status, content: data });
      } else reject(Error(`Request failed: ${xhr.status} ${xhr.statusText}`));
    });

    xhr.addEventListener("error", () => {
      reject(Error("Request failed"));
    });

    xhr.send(body);
  });

export const WithMutex = async (mutexRef: Ref<boolean>, callback: () => void | Promise<void>) => {
  if (mutexRef.current) {
    return;
  }
  mutexRef.current = true;

  try {
    await callback();
  } finally {
    mutexRef.current = false;
  }
};
