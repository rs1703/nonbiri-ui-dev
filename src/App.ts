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
