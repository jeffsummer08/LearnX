import express, { Express, Response, Request } from 'express';

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
})

app.listen(8080, () => {
  console.log('Listening on port 8080');
});