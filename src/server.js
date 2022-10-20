/* server는 always request를 listening 하고 있다. */
/* node_modules/express 에서 익스프레스를 가져온다.*/
import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import video from "./routers/videoRouter";
import user from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

/* request를 받는 PORT를 설정한다. 
PORT는 내 컴퓨터로의 창이나 문 같은것.
4000번을 쓰는 것은 백엔드 관습이기도 하고, 거의 항상 비어있다. */

/* express함수를 호출하면 express application을 바로 사용할 수
있게 return 해준다. 모든 것은 app에 있다. */
const app = express();
const logger = morgan("dev");

app.set("view engine","pug");
app.set("views", process.cwd() + "/src/views");
app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
    });
app.use(logger);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
//이 미들웨어는 브라우저에 쿠키를 보낸다.
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl:process.env.DB_URL})
}))

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/",rootRouter);
app.use("/videos",video);
app.use("/users",user);
app.use("/api",apiRouter);


export default app;



