export const sendRequest = async <T = any>(path: string, method = "GET", body?: any): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path);

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
      else reject(Error(`Request failed: ${xhr.status} ${xhr.statusText}`));
    });

    xhr.addEventListener("error", () => {
      reject(Error("Request failed"));
    });

    xhr.send(body);
  });

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;

export const generateUniqueString = () => {
  let result = "_";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const formatUnix = (unix: number) => {
  const time = new Date(unix);
  const month = (time.getMonth() + 1).toString().padStart(2, "0");
  const date = time.getDate().toString().padStart(2, "0");
  const year = time.getFullYear().toString().slice(-2);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  return `${month}/${date}/${year} ${hours}:${minutes}`;
};

export const formatGroups = (groups: string[]) => {
  const lastGroupName = groups?.pop();
  return groups?.length ? `${groups.join(", ")} & ${lastGroupName}` : lastGroupName;
};

export const loadImage = (url: string) =>
  new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.src = url;

    if (image.complete) {
      resolve();
    } else {
      image.addEventListener("load", () => resolve());
      image.addEventListener("error", () => reject());
    }
  });
