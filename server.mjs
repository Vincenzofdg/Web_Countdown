import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const PORT = 3000;

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const PATH = process.cwd();

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  const paths = [PATH, url];
  if (url.endsWith("/")) paths.push("index.html");
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

http
  .createServer(async (req, res) => {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    res.writeHead(statusCode, { "Content-Type": mimeType });
    file.stream.pipe(res);
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
