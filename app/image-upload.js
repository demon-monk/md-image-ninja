const fs = require("fs");
const path = require("path");
const notifier = require("node-notifier");
const FormData = require("form-data");
const axios = require("axios").default;
const { clipboard } = require("electron");
const { format } = require("date-fns");
const BASE_URL = "https://sm.ms/api/v2/";

let Authorization = "";
try {
  Authorization = fs.readFileSync(path.join(__dirname, "..", "config.json"));
} catch (e) {
  notifier.notify({
    title: "尚未设置API Token",
    message:
      "请登录sm.ms查看并复制你的API Token到剪切板上，然后回来设置API Token"
  });
}

let BASE_REQUEST_CONFIG = {
  baseURL: BASE_URL,
  headers: {
    Authorization,
    "Content-Type": "multipart/form-data"
  }
};

let FILE_REQUEST_CONFIG = {
  baseURL: BASE_URL,
  headers: {
    Authorization,
    "Content-Type": "multipart/form-data"
  }
};
let baseInstance = axios.create(BASE_REQUEST_CONFIG);
let fileInstance = axios.create(FILE_REQUEST_CONFIG);

const refreshBaseInstance = () =>
  (baseInstance = axios.create(BASE_REQUEST_CONFIG));
const refreshFileInstance = () =>
  (fileInstance = axios.create(FILE_REQUEST_CONFIG));

exports.setToken = () => {
  const token = clipboard.readText();
  fs.writeFile(
    path.join(__dirname, "..", "config.json"),
    JSON.stringify({ token }),
    () => {
      getTempUploadHistory().then(data => {
        if (data.success) {
          notifier.notify({
            title: "API Token设置成功",
            message: "你可以快速将截图上传到图床并获取到MD链接啦"
          });
        } else {
          notifier.notify({
            title: "API Token设置失败",
            message: "请确认是否已将正确的API Token复制到剪切板内"
          });
        }
      });
    }
  );
  BASE_REQUEST_CONFIG = {
    ...BASE_REQUEST_CONFIG,
    headers: {
      Authorization: token
    }
  };
  FILE_REQUEST_CONFIG = {
    ...FILE_REQUEST_CONFIG,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token
    }
  };
  refreshBaseInstance();
  refreshFileInstance();
};

const getTempUploadHistory = (exports.getTempUploadHistory = (
  format = "json"
) =>
  baseInstance.get("/history", { format }).then(resp => {
    console.log(resp.data);
    return resp.data;
  }));

exports.uploadImageFromClipboard = () => {
  const image = clipboard.readImage().toPNG();
  const formData = new FormData();
  formData.append(
    "smfile",
    image,
    `${format(new Date(), "yyyy-MM-dd-hh-mm-ss")}.png`
  );
  formData.append("format", "json");
  return fileInstance
    .post("/upload", formData, { headers: formData.getHeaders() })
    .then(resp => {
      try {
        return resp.data.data.url;
      } catch (e) {
        return Promise.reject({ message: "cannot retrive image url" });
      }
    })
    .then(url => {
      const mdimage = `![](${url})`;
      clipboard.writeText(mdimage);
      return mdimage;
    })
    .catch(err => console.error(err));
};
